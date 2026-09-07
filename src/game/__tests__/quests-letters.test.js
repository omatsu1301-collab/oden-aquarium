import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../state.js";
import { evaluateQuest } from "../quests.js";
import { isLetterAvailable, listLetterViews } from "../letters.js";

const T0 = 1_700_000_000_000;

describe("quests", () => {
  it("catalogクエストは5種類発見で達成する(架空の8種類ではない)", () => {
    let state = createInitialGameState(T0, 1);
    for (const id of ["daikon", "chikuwa", "shirataki", "konnyaku"]) {
      state = { ...state, catalog: { ...state.catalog, [id]: { firstSeenAt: T0, harvestCount: 1, favorite: false, bowlId: "bowl-white", brothCounts: {} } } };
    }
    expect(evaluateQuest(state, "catalog").complete).toBe(false);
    state = { ...state, catalog: { ...state.catalog, ganmo: { firstSeenAt: T0, harvestCount: 1, favorite: false, bowlId: "bowl-white", brothCounts: {} } } };
    expect(evaluateQuest(state, "catalog").complete).toBe(true);
    expect(evaluateQuest(state, "catalog").target).toBe(5);
  });

  it("dyesクエストは種類×出汁の組み合わせ10通りで達成する", () => {
    let state = createInitialGameState(T0, 1);
    const brothCounts = { kombu: 1, katsuo: 1, miso: 1, soy: 1, salt: 1 };
    state = {
      ...state,
      catalog: {
        daikon: { firstSeenAt: T0, harvestCount: 5, favorite: false, bowlId: "bowl-white", brothCounts },
        chikuwa: { firstSeenAt: T0, harvestCount: 5, favorite: false, bowlId: "bowl-white", brothCounts: { kombu: 1, katsuo: 1, miso: 1, soy: 1, salt: 1 } },
      },
    };
    expect(evaluateQuest(state, "dyes").complete).toBe(true);
  });
});

describe("letters", () => {
  it("welcomeは最初から利用可能", () => {
    const state = createInitialGameState(T0, 1);
    expect(isLetterAvailable(state, "welcome")).toBe(true);
  });

  it("catalog-completeは5種類発見するまで出てこない", () => {
    const state = createInitialGameState(T0, 1);
    expect(isLetterAvailable(state, "catalog-complete")).toBe(false);
    const letters = listLetterViews(state).map((l) => l.id);
    expect(letters).not.toContain("catalog-complete");
  });

  it("first-purchaseは購入するまで出てこない", () => {
    const state = createInitialGameState(T0, 1);
    expect(isLetterAvailable(state, "first-purchase")).toBe(false);
    const purchased = { ...state, stats: { ...state.stats, hasPurchased: true } };
    expect(isLetterAvailable(purchased, "first-purchase")).toBe(true);
  });
});
