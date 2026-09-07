import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadGameState, saveGameState, peekStoredRevision } from "../persistence.js";
import { LOCAL_STORAGE_KEY, LOCAL_STORAGE_V1_BACKUP_KEY } from "../../game/constants.js";
import { createInitialCharacterState } from "../../logic/derive.js";

const T0 = 1_700_000_000_000;

function createFakeLocalStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    _store: store,
  };
}

beforeEach(() => {
  globalThis.window = { localStorage: createFakeLocalStorage() };
});

afterEach(() => {
  delete globalThis.window;
});

describe("loadGameState", () => {
  it("キーが存在しない場合は新規状態を作成して保存する", () => {
    const result = loadGameState(T0);
    expect(result.status).toBe("ok");
    expect(result.isNew).toBe(true);
    expect(window.localStorage.getItem(LOCAL_STORAGE_KEY)).not.toBeNull();
  });

  it("壊れたJSONは上書きせずcorruptを返す", () => {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, "{ broken");
    const result = loadGameState(T0);
    expect(result.status).toBe("corrupt");
    expect(result.reason).toBe("invalid-json");
    expect(window.localStorage.getItem(LOCAL_STORAGE_KEY)).toBe("{ broken");
  });

  it("未知のschemaVersionは自動初期化しない", () => {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ schemaVersion: 999 }));
    const result = loadGameState(T0);
    expect(result.status).toBe("corrupt");
    expect(window.localStorage.getItem(LOCAL_STORAGE_KEY)).toContain("999");
  });

  it("v1データはバックアップを取ってからv2へ移行する", () => {
    const v1 = { schemaVersion: 1, characters: { daikon: createInitialCharacterState(T0) } };
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(v1));
    const result = loadGameState(T0);
    expect(result.status).toBe("ok");
    expect(result.migrated).toBe(true);
    expect(window.localStorage.getItem(LOCAL_STORAGE_V1_BACKUP_KEY)).toBe(JSON.stringify(v1));
    const reloaded = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY));
    expect(reloaded.schemaVersion).toBe(2);
  });

  it("正常なv2データはそのまま読み込める(再初期化しない)", () => {
    const first = loadGameState(T0);
    saveGameState({ ...first.data, wallet: 12345 });
    const second = loadGameState(T0 + 1000);
    expect(second.status).toBe("ok");
    expect(second.data.wallet).toBe(12345);
  });
});

describe("peekStoredRevision", () => {
  it("キーが存在しない場合はexists:falseを返す", () => {
    expect(peekStoredRevision(LOCAL_STORAGE_KEY)).toEqual({ exists: false, revision: null });
  });

  it("正常なv2データのrevisionを書き換えずに返す", () => {
    const first = loadGameState(T0);
    saveGameState({ ...first.data, revision: 7 });
    expect(peekStoredRevision(LOCAL_STORAGE_KEY)).toEqual({ exists: true, revision: 7 });
    // 覗き見るだけで内容を変えていないことを確認する。
    expect(JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY)).revision).toBe(7);
  });

  it("壊れたJSONはexists:true, revision:nullを返す(上書きしてはいけない合図)", () => {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, "{ broken");
    expect(peekStoredRevision(LOCAL_STORAGE_KEY)).toEqual({ exists: true, revision: null });
  });
});
