import { describe, expect, it } from "vitest";
import { getShopItem } from "../../data/shopCatalog.js";
import { getShopCardDisplayStatus } from "../shopCardStatus.js";

const KOMBU = getShopItem("kombu");
const KATSUO = getShopItem("katsuo");
const MISO = getShopItem("miso");
const CLAY = getShopItem("clay");
const ENAMEL = getShopItem("enamel");
const LID_WOOD = getShopItem("lid-wood");
const PADDLE = getShopItem("paddle");
const DROP = getShopItem("drop");
const PEBBLE = getShopItem("pebble");
const BOWL_WHITE = getShopItem("bowl-white");

function makeState({
  wallet = 300,
  brothId = "kombu",
  potId = "clay",
  tools = { lid: null, paddle: false, lamp: false },
  decorationId = null,
  ownedIds = ["kombu", "clay", "bowl-white"],
  consumables = {},
  growth = null,
  care = null,
  remainingRatio = 1,
} = {}) {
  return {
    wallet,
    tank: { brothId, potId, tools, decorationId, remainingRatio },
    inventory: { ownedIds, consumables },
    effects: { growth, care },
  };
}

describe("getShopCardDisplayStatus", () => {
  it("装備中の出汁は使用中", () => {
    expect(getShopCardDisplayStatus(KOMBU, makeState()).kind).toBe("active");
    expect(getShopCardDisplayStatus(KOMBU, makeState()).label).toBe("使用中");
  });

  it("装備中の鍋は使用中", () => {
    expect(getShopCardDisplayStatus(CLAY, makeState()).label).toBe("使用中");
  });

  it("装備中の道具は使用中", () => {
    const state = makeState({ tools: { lid: "lid-wood", paddle: false, lamp: false } });
    expect(getShopCardDisplayStatus(LID_WOOD, state).label).toBe("使用中");
  });

  it("paddleフラグがtrueなら出汁まわしも使用中", () => {
    const state = makeState({ tools: { lid: null, paddle: true, lamp: false } });
    expect(getShopCardDisplayStatus(PADDLE, state).label).toBe("使用中");
  });

  it("水槽飾りを飾っているときは使用中", () => {
    const state = makeState({
      ownedIds: ["kombu", "clay", "bowl-white", "pebble"],
      decorationId: "pebble",
    });
    expect(getShopCardDisplayStatus(PEBBLE, state).label).toBe("使用中");
  });

  it("assistがactiveなら所持数0でも使用中", () => {
    const state = makeState({
      consumables: {},
      growth: { itemId: "drop", multiplier: 1.5, expiresAt: 1 },
    });
    expect(getShopCardDisplayStatus(DROP, state)).toMatchObject({ kind: "active", label: "使用中" });
  });

  it("permanentの所持済みで未装備なら所持", () => {
    expect(getShopCardDisplayStatus(BOWL_WHITE, makeState()).kind).toBe("owned");
    expect(getShopCardDisplayStatus(BOWL_WHITE, makeState()).label).toBe("所持");
  });

  it("未装備のpermanent所持は使用中と混同しない", () => {
    const state = makeState({
      potId: "clay",
      ownedIds: ["kombu", "clay", "enamel", "bowl-white"],
    });
    expect(getShopCardDisplayStatus(ENAMEL, state).label).toBe("所持");
    expect(getShopCardDisplayStatus(CLAY, state).label).toBe("使用中");
  });

  it("consumableの所持ありは所持×N", () => {
    const state = makeState({ consumables: { drop: 3 } });
    expect(getShopCardDisplayStatus(DROP, state)).toMatchObject({ kind: "owned", label: "所持×3" });
  });

  it("未所持かつ残高内なら購入可能、価格も返す", () => {
    const status = getShopCardDisplayStatus(KATSUO, makeState({ wallet: 300 }));
    expect(status).toMatchObject({ kind: "purchasable", label: "購入可能", price: 300 });
  });

  it("未所持かつ残高不足なら残高不足、価格も返す", () => {
    const status = getShopCardDisplayStatus(MISO, makeState({ wallet: 300 }));
    expect(status).toMatchObject({ kind: "shortfall", label: "残高不足", price: 500 });
  });

  it("consumable未所持でもwalletで買えるなら購入可能", () => {
    const status = getShopCardDisplayStatus(DROP, makeState({ wallet: 80, consumables: {} }));
    expect(status).toMatchObject({ kind: "purchasable", label: "購入可能", price: 80 });
  });

  it("器をいずれかの具材へ適用中なら使用中", () => {
    const state = makeState({
      ownedIds: ["kombu", "clay", "bowl-white", "bowl-indigo"],
    });
    state.catalog = {
      daikon: { firstSeenAt: 1, harvestCount: 1, bowlId: "bowl-indigo", favorite: false, brothCounts: {} },
    };
    expect(getShopCardDisplayStatus(getShopItem("bowl-indigo"), state).label).toBe("使用中");
    expect(getShopCardDisplayStatus(BOWL_WHITE, state).label).toBe("所持");
  });

  it("game actionや保存状態を変更しない", () => {
    const state = makeState({ wallet: 300, consumables: { drop: 1 } });
    const frozenWallet = state.wallet;
    getShopCardDisplayStatus(DROP, state);
    getShopCardDisplayStatus(MISO, state);
    expect(state.wallet).toBe(frozenWallet);
    expect(state.inventory.consumables.drop).toBe(1);
    expect(state.tank.brothId).toBe("kombu");
  });
});
