// 永続化処理(v2): localStorageへの読み書き、v1→v2移行、破損データの保護。
// 「schema未知/不正JSONは自動初期化して上書きしない」(仕様7.2)ため、
// 読み込みに失敗した場合はloadGameStateが status:"corrupt" を返し、
// 元の生データ(raw)をそのまま保持する(このモジュールが上書きすることはない)。
//
// storageKeyは既定でLOCAL_STORAGE_KEY(本番保存)だが、?debug=1のfixture操作は
// 別キー(DEBUG_LOCAL_STORAGE_KEY)を明示的に渡すことで、本番データを一切汚染しない
// (仕様9: 「通常保存と別キー/別storeを用い、復帰時に本番データを汚染しない」)。
import { LOCAL_STORAGE_KEY, LOCAL_STORAGE_V1_BACKUP_KEY } from "../game/constants.js";
import { createInitialGameState } from "../game/state.js";
import { createFreshSeed } from "../game/rng.js";
import { validateGameState } from "../game/validate.js";
import { isV1SaveData, migrateV1ToV2 } from "../game/migration.js";

function readRaw(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return undefined; // localStorage自体が使用不可(例外)
  }
}

function writeRaw(key, value) {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function persistFreshState(nowMs, storageKey) {
  const state = createInitialGameState(nowMs, createFreshSeed());
  writeRaw(storageKey, JSON.stringify(state));
  return { status: "ok", data: state, migrated: false, isNew: true };
}

// localStorageからv2セーブデータを読み込む。
// 存在しない場合は新規状態を作成して保存する(v1にも存在した挙動)。
// 壊れている/未知バージョンの場合は絶対に上書きせず、corruptとして返す。
export function loadGameState(nowMs, storageKey = LOCAL_STORAGE_KEY) {
  const raw = readRaw(storageKey);

  if (raw === undefined) {
    // localStorage自体に触れない(プライベートモード等)。メモリ上でのみ新規状態を使う。
    return { status: "ok", data: createInitialGameState(nowMs, createFreshSeed()), migrated: false, isNew: true };
  }
  if (raw === null) {
    return persistFreshState(nowMs, storageKey);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { status: "corrupt", raw, reason: "invalid-json" };
  }

  if (parsed && typeof parsed === "object" && parsed.schemaVersion === 2) {
    const validated = validateGameState(parsed);
    if (!validated) {
      return { status: "corrupt", raw, reason: "invalid-v2-shape" };
    }
    return { status: "ok", data: validated, migrated: false, isNew: false };
  }

  if (storageKey === LOCAL_STORAGE_KEY && isV1SaveData(parsed)) {
    const backupOk = writeRaw(LOCAL_STORAGE_V1_BACKUP_KEY, raw);
    if (!backupOk) {
      // 退避に失敗した場合は移行を中断し、旧rawを上書きしない。
      return { status: "corrupt", raw, reason: "v1-backup-failed" };
    }
    const migrated = migrateV1ToV2(parsed, nowMs, createFreshSeed());
    writeRaw(storageKey, JSON.stringify(migrated));
    return { status: "ok", data: migrated, migrated: true, isNew: false };
  }

  return { status: "corrupt", raw, reason: "unknown-version" };
}

// セーブデータを書き込む。書込失敗時はfalseを返す(呼び出し側がUIへ反映する)。
export function saveGameState(state, storageKey = LOCAL_STORAGE_KEY) {
  return writeRaw(storageKey, JSON.stringify(state));
}

// 現在保存されている内容を書き換えずにrevisionだけ覗き見る。
// pagehide/visibilitychangeでの保存が、破損データや他タブのより新しい書き込みを
// 無条件に上書きしないためのガードに使う(仕様7.3)。
export function peekStoredRevision(storageKey = LOCAL_STORAGE_KEY) {
  const raw = readRaw(storageKey);
  if (typeof raw !== "string") return { exists: false, revision: null };
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && typeof parsed.revision === "number") {
      return { exists: true, revision: parsed.revision };
    }
  } catch {
    // 読み取れない = 破損している可能性。exists:trueかつrevision:nullで返す。
  }
  return { exists: true, revision: null };
}

// 復元(バックアップ/インポート)専用: 検証済み状態をそのまま置き換える。
// 置換前に必ず現在の状態の退避に成功していることを呼び出し側が保証する。
export function overwriteGameState(state, storageKey = LOCAL_STORAGE_KEY) {
  return writeRaw(storageKey, JSON.stringify(state));
}

const PRE_RESTORE_BACKUP_KEY = "oden-aquarium/save-pre-restore-backup";

// 復元で置き換える直前の現在状態を退避する。失敗した場合、呼び出し側は置換してはならない。
export function backupCurrentStateBeforeRestore(state) {
  return writeRaw(PRE_RESTORE_BACKUP_KEY, JSON.stringify(state));
}

export function createFreshGameState(nowMs, storageKey = LOCAL_STORAGE_KEY) {
  return persistFreshState(nowMs, storageKey);
}

export function clearStorageKey(storageKey) {
  try {
    window.localStorage.removeItem(storageKey);
    return true;
  } catch {
    return false;
  }
}

export { LOCAL_STORAGE_KEY };
