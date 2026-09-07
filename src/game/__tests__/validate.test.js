import { describe, expect, it } from "vitest";
import { validateGameState } from "../validate.js";
import { createInitialGameState } from "../state.js";

const T0 = 1_700_000_000_000;

describe("validateGameState", () => {
  it("正しい状態はそのまま(実質同値で)通る", () => {
    const state = createInitialGameState(T0, 1);
    const result = validateGameState(state);
    expect(result).not.toBeNull();
    expect(result.wallet).toBe(state.wallet);
    expect(result.slots.length).toBe(5);
  });

  it("nullや配列などの非オブジェクトは拒否する", () => {
    expect(validateGameState(null)).toBeNull();
    expect(validateGameState([1, 2, 3])).toBeNull();
    expect(validateGameState("broken")).toBeNull();
  });

  it("schemaVersionが不一致なら拒否する", () => {
    const state = createInitialGameState(T0, 1);
    expect(validateGameState({ ...state, schemaVersion: 99 })).toBeNull();
  });

  it("walletがNaN/負数/文字列なら拒否する", () => {
    const state = createInitialGameState(T0, 1);
    expect(validateGameState({ ...state, wallet: NaN })).toBeNull();
    expect(validateGameState({ ...state, wallet: -1 })).toBeNull();
    expect(validateGameState({ ...state, wallet: "300" })).toBeNull();
  });

  it("未知のbrothId/potIdは拒否する", () => {
    const state = createInitialGameState(T0, 1);
    expect(validateGameState({ ...state, tank: { ...state.tank, brothId: "mystery" } })).toBeNull();
    expect(validateGameState({ ...state, tank: { ...state.tank, potId: "mystery" } })).toBeNull();
  });

  it("スロットのinstanceId重複は拒否する", () => {
    const state = createInitialGameState(T0, 1);
    const dupSlots = state.slots.map((s) => ({ ...s, instanceId: 1 }));
    expect(validateGameState({ ...state, slots: dupSlots })).toBeNull();
  });

  it("未知の所持アイテムIDは正規化時に除外される(混入させない)", () => {
    const state = createInitialGameState(T0, 1);
    const withJunk = {
      ...state,
      inventory: { ...state.inventory, ownedIds: [...state.inventory.ownedIds, "__proto__", 123] },
    };
    const result = validateGameState(withJunk);
    expect(result.inventory.ownedIds.every((id) => typeof id === "string")).toBe(true);
  });
});
