import { describe, expect, it } from "vitest";
import { getShopAssistUseState } from "../shopAssistState.js";
import { getShopItem } from "../../data/shopCatalog.js";

const DROP = getShopItem("drop");
const RICH_DROP = getShopItem("rich-drop");
const CARE = getShopItem("care");
const LONG_CARE = getShopItem("long-care");

function makeState({ remainingRatio = 1, growth = null, care = null } = {}) {
  return {
    tank: { remainingRatio },
    effects: { growth, care },
  };
}

const GROWTH_ACTIVE = { itemId: "drop", multiplier: 1.5, expiresAt: 1 };
const CARE_ACTIVE = { itemId: "care", expiresAt: 1 };

describe("getShopAssistUseState", () => {
  it("dropがactiveならdropはisThisActive", () => {
    const result = getShopAssistUseState(DROP, makeState({ growth: GROWTH_ACTIVE }), 1);
    expect(result.isThisActive).toBe(true);
    expect(result.categoryBusy).toBe(false);
    expect(result.disabled).toBe(false);
  });

  it("dropがactiveならrich-dropはcategoryBusyかつdisabled", () => {
    const result = getShopAssistUseState(RICH_DROP, makeState({ growth: GROWTH_ACTIVE }), 1);
    expect(result.isThisActive).toBe(false);
    expect(result.categoryBusy).toBe(true);
    expect(result.disabled).toBe(true);
  });

  it("growth activeでもcareは、出汁残量があればdisabledにならない", () => {
    const result = getShopAssistUseState(CARE, makeState({ growth: GROWTH_ACTIVE, remainingRatio: 0.4 }), 1);
    expect(result.isThisActive).toBe(false);
    expect(result.categoryBusy).toBe(false);
    expect(result.careBlocked).toBe(false);
    expect(result.disabled).toBe(false);
  });

  it("careがactiveならlong-careはcategoryBusyかつdisabled", () => {
    const result = getShopAssistUseState(LONG_CARE, makeState({ care: CARE_ACTIVE }), 1);
    expect(result.isThisActive).toBe(false);
    expect(result.categoryBusy).toBe(true);
    expect(result.disabled).toBe(true);
  });

  it("care activeでもgrowthはdisabledにならない", () => {
    const result = getShopAssistUseState(DROP, makeState({ care: CARE_ACTIVE }), 1);
    expect(result.isThisActive).toBe(false);
    expect(result.categoryBusy).toBe(false);
    expect(result.disabled).toBe(false);
  });

  it("出汁残量0ならcare系はcareBlockedかつdisabled", () => {
    const result = getShopAssistUseState(CARE, makeState({ remainingRatio: 0 }), 1);
    expect(result.careBlocked).toBe(true);
    expect(result.disabled).toBe(true);
  });

  it("出汁残量0でもgrowth系はcareBlockedにならない", () => {
    const result = getShopAssistUseState(DROP, makeState({ remainingRatio: 0 }), 1);
    expect(result.careBlocked).toBe(false);
    expect(result.disabled).toBe(false);
  });

  it("所持0ならdisabled", () => {
    const result = getShopAssistUseState(DROP, makeState(), 0);
    expect(result.disabled).toBe(true);
    expect(result.categoryBusy).toBe(false);
    expect(result.careBlocked).toBe(false);
  });

  it("不明なeffectCategoryはcareへfallbackしない", () => {
    const unknown = { id: "mystery", effectCategory: "mystery" };
    const state = makeState({ remainingRatio: 0, care: CARE_ACTIVE });
    const result = getShopAssistUseState(unknown, state, 1);
    expect(result.isThisActive).toBe(false);
    expect(result.categoryBusy).toBe(false);
    expect(result.careBlocked).toBe(false);
    expect(result.disabled).toBe(true);
  });
});
