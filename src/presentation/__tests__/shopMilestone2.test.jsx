import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ShopMediaSlot } from "../../components/ShopMediaSlot.jsx";
import { SPECIES_ORDER } from "../../data/species.js";
import { ASSIST_ORDER } from "../../data/assists.js";
import { BROTH_ORDER } from "../../data/broths.js";
import { BOWL_DECORATION_ORDER, TANK_DECORATION_ORDER } from "../../data/decorations.js";
import { POT_ORDER } from "../../data/pots.js";
import { ALL_ITEM_COUNT, SHOP_TABS, getShopItem, getShopTabItems } from "../../data/shopCatalog.js";
import { TOOL_ORDER } from "../../data/tools.js";
import { applyAction } from "../../game/actions.js";
import { DEBUG_LOCAL_STORAGE_KEY, LOCAL_STORAGE_KEY } from "../../game/constants.js";
import { createInitialGameState } from "../../game/state.js";
import { formatAssistDisabledReason } from "../assistDisabledReason.js";
import { getBowlApplyTargets } from "../bowlApplyTargets.js";
import { getShopAssistUseState } from "../shopAssistState.js";
import { getShopItemImageUrl } from "../shopItemMedia.js";
import { loadGameState, saveGameState } from "../../storage/persistence.js";
import { ShopItemDetailSheet } from "../../screens/ShopItemDetailSheet.jsx";

const T0 = 1_700_000_000_000;

function createFakeLocalStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
  };
}

describe("Milestone 2 shop catalog counts", () => {
  it("5カテゴリ26商品の件数と順序を維持する", () => {
    expect(SHOP_TABS.map((t) => t.id)).toEqual(["broth", "pot", "tool", "assist", "decoration"]);
    expect(getShopTabItems("broth").map((i) => i.id)).toEqual(BROTH_ORDER);
    expect(getShopTabItems("pot").map((i) => i.id)).toEqual(POT_ORDER);
    expect(getShopTabItems("tool").map((i) => i.id)).toEqual(TOOL_ORDER);
    expect(getShopTabItems("assist").map((i) => i.id)).toEqual(ASSIST_ORDER);
    expect(getShopTabItems("decoration").map((i) => i.id)).toEqual([
      ...TANK_DECORATION_ORDER,
      ...BOWL_DECORATION_ORDER,
    ]);
    expect(getShopTabItems("broth")).toHaveLength(6);
    expect(getShopTabItems("pot")).toHaveLength(4);
    expect(getShopTabItems("tool")).toHaveLength(4);
    expect(getShopTabItems("assist")).toHaveLength(4);
    expect(getShopTabItems("decoration")).toHaveLength(8);
    expect(ALL_ITEM_COUNT).toBe(26);
  });
});

describe("Milestone 2 purchase / equip / use flows", () => {
  it("各カテゴリ代表商品の購入でwalletが減り所持へ入る", () => {
    let state = { ...createInitialGameState(T0, 1), wallet: 5000 };
    const samples = ["katsuo", "enamel", "paddle", "drop", "pebble"];
    for (const itemId of samples) {
      const before = state.wallet;
      const item = getShopItem(itemId);
      state = applyAction(state, { type: "BUY_ITEM", itemId }, T0);
      expect(state.wallet).toBe(before - item.price);
      if (item.kind === "consumable") {
        expect(state.inventory.consumables[itemId]).toBeGreaterThan(0);
      } else {
        expect(state.inventory.ownedIds).toContain(itemId);
      }
    }
  });

  it("残高不足では購入できずwalletが変わらない", () => {
    const state = createInitialGameState(T0, 1);
    const next = applyAction(state, { type: "BUY_ITEM", itemId: "yuzu" }, T0);
    expect(next.wallet).toBe(state.wallet);
    expect(next.inventory.ownedIds).not.toContain("yuzu");
  });

  it("permanentのequip/switchとtool unequipが成立する", () => {
    let state = { ...createInitialGameState(T0, 1), wallet: 5000 };
    state = applyAction(state, { type: "BUY_ITEM", itemId: "katsuo" }, T0);
    state = applyAction(state, { type: "EQUIP_BROTH", brothId: "katsuo" }, T0);
    expect(state.tank.brothId).toBe("katsuo");
    state = applyAction(state, { type: "EQUIP_BROTH", brothId: "kombu" }, T0);
    expect(state.tank.brothId).toBe("kombu");

    state = applyAction(state, { type: "BUY_ITEM", itemId: "paddle" }, T0);
    state = applyAction(state, { type: "SET_TOOL", toolId: "paddle", slotType: "paddle" }, T0);
    expect(state.tank.tools.paddle).toBe(true);
    state = applyAction(state, { type: "SET_TOOL", toolId: null, slotType: "paddle" }, T0);
    expect(state.tank.tools.paddle).toBe(false);
  });

  it("consumable countとgrowth/care assist、same-effect busyを維持する", () => {
    let state = { ...createInitialGameState(T0, 1), wallet: 5000 };
    state = applyAction(state, { type: "BUY_ITEM", itemId: "drop" }, T0);
    state = applyAction(state, { type: "BUY_ITEM", itemId: "rich-drop" }, T0);
    state = applyAction(state, { type: "BUY_ITEM", itemId: "care" }, T0);
    expect(state.inventory.consumables.drop).toBe(1);

    state = applyAction(state, { type: "USE_ASSIST", assistId: "drop" }, T0);
    expect(state.effects.growth?.itemId).toBe("drop");
    const busy = getShopAssistUseState(getShopItem("rich-drop"), state, 1);
    expect(busy.categoryBusy).toBe(true);
    expect(busy.disabled).toBe(true);

    state = applyAction(state, { type: "USE_ASSIST", assistId: "care" }, T0);
    expect(state.effects.care?.itemId).toBe("care");
  });

  it("出汁残量0ではcare assistを使えず消費しない", () => {
    let state = {
      ...createInitialGameState(T0, 1),
      wallet: 5000,
      tank: { ...createInitialGameState(T0, 1).tank, remainingRatio: 0 },
    };
    state = applyAction(state, { type: "BUY_ITEM", itemId: "care" }, T0);
    const before = state.inventory.consumables.care;
    const next = applyAction(state, { type: "USE_ASSIST", assistId: "care" }, T0);
    expect(next.inventory.consumables.care).toBe(before);
    expect(next.effects.care).toBeNull();
    expect(formatAssistDisabledReason({
      ...getShopAssistUseState(getShopItem("care"), next, before),
      owned: before,
    })).toBe("出汁を足してから使えます");
  });

  it("decorationの装着・取り外し・切替ができる", () => {
    let state = { ...createInitialGameState(T0, 1), wallet: 5000 };
    state = applyAction(state, { type: "BUY_ITEM", itemId: "pebble" }, T0);
    state = applyAction(state, { type: "BUY_ITEM", itemId: "kelp" }, T0);
    state = applyAction(state, { type: "APPLY_DECORATION", decorationId: "pebble" }, T0);
    expect(state.tank.decorationId).toBe("pebble");
    state = applyAction(state, { type: "APPLY_DECORATION", decorationId: "kelp" }, T0);
    expect(state.tank.decorationId).toBe("kelp");
    state = applyAction(state, { type: "APPLY_DECORATION", decorationId: null }, T0);
    expect(state.tank.decorationId).toBeNull();
  });
});

describe("Milestone 2 bowl apply targets 0/1/5", () => {
  it("発見0/1/5件で適用対象数が変わる", () => {
    const base = createInitialGameState(T0, 1);
    expect(getBowlApplyTargets(base)).toHaveLength(0);

    const one = {
      ...base,
      catalog: {
        ...base.catalog,
        daikon: { ...base.catalog.daikon, firstSeenAt: T0, harvestCount: 1 },
      },
    };
    expect(getBowlApplyTargets(one)).toEqual(["daikon"]);

    const five = {
      ...base,
      catalog: Object.fromEntries(
        SPECIES_ORDER.map((id) => [
          id,
          { firstSeenAt: T0, harvestCount: 1, favorite: false, bowlId: "bowl-white", brothCounts: {} },
        ]),
      ),
    };
    expect(getBowlApplyTargets(five)).toHaveLength(5);
  });
});

describe("Milestone 2 media / detail contracts", () => {
  it("既存assetがある商品だけ画像URLを返し、無い商品はnull", () => {
    expect(getShopItemImageUrl(getShopItem("kombu"))).toContain("broth-kombu.webp");
    expect(getShopItemImageUrl(getShopItem("drop"))).toContain("assist-drop.webp");
    expect(getShopItemImageUrl(getShopItem("bowl-white"))).toContain("bowl-white.webp");
    expect(getShopItemImageUrl(getShopItem("copper"))).toContain("pot-copper.webp");
    expect(getShopItemImageUrl(getShopItem("paddle"))).toContain("tool-paddle.webp");
    expect(getShopItemImageUrl(getShopItem("clay"))).toContain("pot-clay.webp");
    expect(getShopItemImageUrl(getShopItem("pebble"))).toContain("decoration-pebble.webp");
  });

  it("neutral media slotは固定aspect classを持ち、src無しならimgを出さない", () => {
    const html = renderToStaticMarkup(createElement(ShopMediaSlot, { src: null }));
    expect(html).toContain("shop-media-slot");
    expect(html).not.toContain("<img");
  });

  it("detail sheetはmedia slotと購入/使用導線を持つ", () => {
    const state = createInitialGameState(T0, 1);
    const html = renderToStaticMarkup(
      createElement(ShopItemDetailSheet, {
        open: true,
        onClose: () => {},
        itemId: "katsuo",
        state,
        dispatch: () => {},
      }),
    );
    expect(html).toContain("shop-media-slot");
    expect(html).toContain("購入する");
    expect(html).toContain("かつおだし");
  });

  it("assist disabled reasonを詳細へ出せる", () => {
    expect(formatAssistDisabledReason({ owned: 0, categoryBusy: false, careBlocked: false, disabled: true })).toBe(
      "未所持",
    );
    expect(formatAssistDisabledReason({ owned: 1, categoryBusy: true, careBlocked: false, disabled: true })).toBe(
      "同系統を使用中",
    );
  });
});

describe("Milestone 2 reload persistence", () => {
  beforeEach(() => {
    globalThis.window = { localStorage: createFakeLocalStorage() };
  });
  afterEach(() => {
    delete globalThis.window;
  });

  it("購入・装備・assist・decorationをsave/loadしても復元する", () => {
    let state = { ...createInitialGameState(T0, 1), wallet: 5000 };
    state = applyAction(state, { type: "BUY_ITEM", itemId: "katsuo" }, T0);
    state = applyAction(state, { type: "EQUIP_BROTH", brothId: "katsuo" }, T0);
    state = applyAction(state, { type: "BUY_ITEM", itemId: "drop" }, T0);
    state = applyAction(state, { type: "USE_ASSIST", assistId: "drop" }, T0);
    state = applyAction(state, { type: "BUY_ITEM", itemId: "pebble" }, T0);
    state = applyAction(state, { type: "APPLY_DECORATION", decorationId: "pebble" }, T0);
    state = { ...state, revision: (state.revision ?? 0) + 1 };

    expect(saveGameState(state)).toBe(true);
    const loaded = loadGameState(T0);
    expect(loaded.status).toBe("ok");
    expect(loaded.data.tank.brothId).toBe("katsuo");
    expect(loaded.data.tank.decorationId).toBe("pebble");
    expect(loaded.data.effects.growth?.itemId).toBe("drop");
    expect(loaded.data.inventory.ownedIds).toContain("katsuo");
  });

  it("debug保存キーは本番キーと分離される", () => {
    const state = { ...createInitialGameState(T0, 1), wallet: 1234, revision: 2 };
    saveGameState(state, DEBUG_LOCAL_STORAGE_KEY);
    expect(window.localStorage.getItem(DEBUG_LOCAL_STORAGE_KEY)).toContain("1234");
    expect(window.localStorage.getItem(LOCAL_STORAGE_KEY)).toBeNull();
  });
});
