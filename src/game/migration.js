// v1(初期完成版)セーブデータをv2(遊べる完成版)へ移行する。
// 旧純粋関数(src/logic/derive.js)は変更せず、移行専用にそのまま利用する。
import { deriveDashiLevel } from "../logic/derive.js";
import { DAIKON_CHARACTER_ID } from "../constants.js";
import { createInitialGameState, createInitialSlots } from "./state.js";

// v1データが妥当な形かどうか(schemaVersion 1 + daikonのanchor情報)を確認する。
export function isV1SaveData(data) {
  if (data === null || typeof data !== "object") return false;
  if (data.schemaVersion !== 1) return false;
  const daikon = data.characters?.[DAIKON_CHARACTER_ID];
  if (daikon === null || typeof daikon !== "object") return false;
  return (
    typeof daikon.anchorValue === "number" &&
    !Number.isNaN(daikon.anchorValue) &&
    typeof daikon.anchorTimeMs === "number" &&
    !Number.isNaN(daikon.anchorTimeMs)
  );
}

// v1の大根dashiLevelを移行時点の値へ引き継ぎ、以降は新速度で成長させる
// (旧経過へ新速度を遡及適用しない)。他4体・所持ポイント等は新規開始と同じ値にする。
// 旧版には収穫履歴がないため、発見日・収穫数は作らない(catalogは空のまま)。
export function migrateV1ToV2(v1Data, nowMs, seed) {
  const migratedDaikonProgress = deriveDashiLevel(v1Data.characters[DAIKON_CHARACTER_ID], nowMs);

  const state = createInitialGameState(nowMs, seed);
  const slots = createInitialSlots(nowMs);
  slots[0] = { ...slots[0], progress: migratedDaikonProgress };

  return { ...state, slots };
}
