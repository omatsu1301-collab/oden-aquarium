// 永続化処理: localStorageへの読み書き。
// JSON parseの例外処理とschemaVersionチェックを担当する。
import { LOCAL_STORAGE_KEY } from "../constants.js";
import { createInitialSaveData, isValidSaveData } from "../logic/derive.js";

// 初期状態を生成し、その場でlocalStorageに保存してから返す。
// (「状態が存在しない」→「初期状態が存在する」という変化が発生した直後の保存)
function createAndPersistInitialSaveData(nowMs) {
  const initial = createInitialSaveData(nowMs);
  saveSaveData(initial);
  return initial;
}

// localStorageからセーブデータを読み込む。
// 存在しない・JSONとして壊れている・schemaVersionが不一致な場合は、
// 例外を投げずに初期状態を生成して返す。
export function loadSaveData(nowMs) {
  let raw;
  try {
    raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  } catch {
    return createAndPersistInitialSaveData(nowMs);
  }

  if (raw === null) {
    return createAndPersistInitialSaveData(nowMs);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return createAndPersistInitialSaveData(nowMs);
  }

  if (!isValidSaveData(parsed)) {
    return createAndPersistInitialSaveData(nowMs);
  }

  return parsed;
}

// セーブデータをlocalStorageに書き込む。
export function saveSaveData(saveData) {
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(saveData));
  } catch {
    // localStorageが使用不可(プライベートモード等)でもアプリを止めない。
  }
}
