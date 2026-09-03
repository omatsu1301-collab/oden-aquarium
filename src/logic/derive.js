// 状態計算ロジック(純粋関数)。
// Reactに依存しない。DOM操作やフックは一切使わない。
import {
  DAIKON_CHARACTER_ID,
  DASHI_LEVEL_MAX,
  DASHI_LEVEL_MIN,
  DASHI_SOAK_RATE_PER_HOUR,
  MS_PER_HOUR,
  SCHEMA_VERSION,
} from "../constants.js";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// 新規キャラクター1体分の初期状態(出汁が染み込んでいない状態)を生成する。
export function createInitialCharacterState(nowMs) {
  return {
    anchorValue: DASHI_LEVEL_MIN,
    anchorTimeMs: nowMs,
  };
}

// アプリ全体の初期状態を生成する。
// データ構造は複数キャラクターを前提にした形(characters: { [id]: {...} })にする。
export function createInitialSaveData(nowMs) {
  return {
    schemaVersion: SCHEMA_VERSION,
    characters: {
      [DAIKON_CHARACTER_ID]: createInitialCharacterState(nowMs),
    },
  };
}

// anchorValue / anchorTimeMs と現在時刻から、現在のdashiLevelを算出する。
// 時計が過去に戻された場合(nowMs < anchorTimeMs)でも、経過時間を0未満にせず
// dashiLevelが増加方向に誤算出されないようにクランプする。
export function deriveDashiLevel(character, nowMs) {
  const elapsedMs = Math.max(0, nowMs - character.anchorTimeMs);
  const elapsedHours = elapsedMs / MS_PER_HOUR;
  const rawValue = character.anchorValue + elapsedHours * DASHI_SOAK_RATE_PER_HOUR;
  return clamp(rawValue, DASHI_LEVEL_MIN, DASHI_LEVEL_MAX);
}

// セーブデータの形状を検証する。壊れている場合はfalseを返す。
export function isValidSaveData(data) {
  if (data === null || typeof data !== "object") {
    return false;
  }
  if (data.schemaVersion !== SCHEMA_VERSION) {
    return false;
  }
  if (data.characters === null || typeof data.characters !== "object") {
    return false;
  }
  const daikon = data.characters[DAIKON_CHARACTER_ID];
  if (daikon === null || typeof daikon !== "object") {
    return false;
  }
  if (typeof daikon.anchorValue !== "number" || Number.isNaN(daikon.anchorValue)) {
    return false;
  }
  if (typeof daikon.anchorTimeMs !== "number" || Number.isNaN(daikon.anchorTimeMs)) {
    return false;
  }
  return true;
}

// デバッグ用: 指定したキャラクターのanchorTimeMsを指定ミリ秒分だけ過去にずらした
// 新しいセーブデータを返す(anchorValueは現在のdashiLevelで固定し直す)。
export function advanceCharacterTime(saveData, characterId, deltaMs, nowMs) {
  const character = saveData.characters[characterId];
  const currentDashiLevel = deriveDashiLevel(character, nowMs);
  return {
    ...saveData,
    characters: {
      ...saveData.characters,
      [characterId]: {
        anchorValue: currentDashiLevel,
        anchorTimeMs: nowMs - deltaMs,
      },
    },
  };
}
