// JSONバックアップの書き出し/読み込み。ファイルI/O(Blob生成・ダウンロード)はUI側が行い、
// ここではペイロードの組み立てと検証だけを純粋に扱う。
import { BACKUP_APP_ID, BACKUP_FORMAT_VERSION, BACKUP_MAX_BYTES } from "../game/constants.js";
import { validateGameState } from "../game/validate.js";
import { isV1SaveData, migrateV1ToV2 } from "../game/migration.js";
import { createFreshSeed } from "../game/rng.js";
import { getDiscoveredSpeciesCount } from "../game/selectors.js";

export function buildBackupPayload(state, nowMs) {
  return {
    appId: BACKUP_APP_ID,
    formatVersion: BACKUP_FORMAT_VERSION,
    exportedAt: nowMs,
    gameState: state,
  };
}

export function buildBackupFileName(nowMs) {
  const d = new Date(nowMs);
  const pad = (n) => String(n).padStart(2, "0");
  const y = d.getFullYear();
  const m = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `oden-aquarium-backup-${y}${m}${day}-${hh}${mm}.json`;
}

// 復元用ファイルの検証。成功時はstateと概要(summary)を返す。
// 「未来バージョンの自動ダウングレード禁止」「外部JSONをObject.assignで無制限に混ぜない」ため、
// 検証はvalidateGameState/migrateV1ToV2を通した結果のみを信頼する。
export function parseBackupFile(rawText, nowMs) {
  if (typeof rawText !== "string" || rawText.length === 0) {
    return { valid: false, reason: "empty" };
  }
  if (new Blob([rawText]).size > BACKUP_MAX_BYTES) {
    return { valid: false, reason: "too-large" };
  }

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return { valid: false, reason: "invalid-json" };
  }

  if (parsed === null || typeof parsed !== "object") {
    return { valid: false, reason: "invalid-shape" };
  }

  // v1形式(旧アプリの生データ)を直接インポートした場合も移行を通す。
  if (isV1SaveData(parsed)) {
    const state = migrateV1ToV2(parsed, nowMs, createFreshSeed());
    return { valid: true, state, summary: summarize(state), fromV1: true };
  }

  if (parsed.appId !== BACKUP_APP_ID) {
    return { valid: false, reason: "wrong-app" };
  }
  if (typeof parsed.formatVersion !== "number" || parsed.formatVersion > BACKUP_FORMAT_VERSION) {
    return { valid: false, reason: "future-version" };
  }

  const state = validateGameState(parsed.gameState);
  if (!state) {
    return { valid: false, reason: "invalid-game-state" };
  }

  return { valid: true, state, summary: summarize(state), fromV1: false };
}

function summarize(state) {
  return {
    wallet: state.wallet,
    discoveredSpeciesCount: getDiscoveredSpeciesCount(state.catalog),
    harvestTotal: state.stats.harvestTotal,
  };
}
