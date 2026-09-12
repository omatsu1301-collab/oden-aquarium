import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  ALL_ITEM_COUNT,
  getShopItem,
  getShopTabItems,
  SHOP_TABS,
} from "../../data/shopCatalog.js";
import { getShopItemImageUrl } from "../shopItemMedia.js";
import { ShopItemCard } from "../../screens/ShopScreen.jsx";
import { ShopItemDetailSheet } from "../../screens/ShopItemDetailSheet.jsx";
import { createInitialGameState } from "../../game/state.js";
import { ShopMediaSlot } from "../../components/ShopMediaSlot.jsx";

const T0 = 1_700_000_000_000;

const EXPECTED_FILES = {
  kombu: "broth-kombu.webp",
  katsuo: "broth-katsuo.webp",
  miso: "broth-miso.webp",
  soy: "broth-soy.webp",
  salt: "broth-salt.webp",
  yuzu: "broth-yuzu.webp",
  clay: "pot-clay.webp",
  enamel: "pot-enamel.webp",
  copper: "pot-copper.webp",
  deep: "pot-deep.webp",
  "lid-wood": "tool-lid-wood.webp",
  "lid-ceramic": "tool-lid-ceramic.webp",
  paddle: "tool-paddle.webp",
  lamp: "tool-lamp.webp",
  drop: "assist-drop.webp",
  "rich-drop": "assist-rich-drop.webp",
  care: "assist-care.webp",
  "long-care": "assist-long-care.webp",
  pebble: "decoration-pebble.webp",
  kelp: "decoration-kelp.webp",
  hideout: "decoration-hideout.webp",
  lantern: "decoration-lantern.webp",
  "bowl-white": "bowl-white.webp",
  "bowl-indigo": "bowl-indigo.webp",
  "bowl-cat": "bowl-cat.webp",
  "bowl-black": "bowl-black.webp",
};

describe("Full Product Art Rollout contract", () => {
  it("商品26件すべて getShopItemImageUrl != null", () => {
    expect(ALL_ITEM_COUNT).toBe(26);
    expect(Object.keys(EXPECTED_FILES)).toHaveLength(26);
    for (const id of Object.keys(EXPECTED_FILES)) {
      expect(getShopItemImageUrl(getShopItem(id))).not.toBeNull();
    }
  });

  it("26商品すべて正しい固有fileへmappingされ、duplicate mappingがない", () => {
    const files = [];
    for (const [id, file] of Object.entries(EXPECTED_FILES)) {
      const url = getShopItemImageUrl(getShopItem(id));
      expect(url).toContain(file);
      expect(url).toContain(import.meta.env.BASE_URL);
      files.push(file);
    }
    expect(new Set(files).size).toBe(26);
  });

  it("lamp と lantern は取り違えない", () => {
    expect(getShopItemImageUrl(getShopItem("lamp"))).toContain("tool-lamp.webp");
    expect(getShopItemImageUrl(getShopItem("lantern"))).toContain(
      "decoration-lantern.webp",
    );
    expect(getShopItemImageUrl(getShopItem("lamp"))).not.toContain(
      "decoration-lantern.webp",
    );
    expect(getShopItemImageUrl(getShopItem("lantern"))).not.toContain(
      "tool-lamp.webp",
    );
  });

  it("card 26商品でimg srcが存在し category icon fallbackがない", () => {
    const state = createInitialGameState(T0, 1);
    for (const [id, file] of Object.entries(EXPECTED_FILES)) {
      const html = renderToStaticMarkup(
        createElement(ShopItemCard, {
          item: getShopItem(id),
          state,
          onOpen: () => {},
        }),
      );
      expect(html).toContain("shop-media-slot");
      expect(html).toContain(file);
      expect(html).not.toContain("shop-item-card__icon");
    }
  });

  it("detail 26商品でcardと同じassetを表示する", () => {
    const state = { ...createInitialGameState(T0, 1), wallet: 5000 };
    for (const [id, file] of Object.entries(EXPECTED_FILES)) {
      const cardUrl = getShopItemImageUrl(getShopItem(id));
      const html = renderToStaticMarkup(
        createElement(ShopItemDetailSheet, {
          open: true,
          onClose: () => {},
          itemId: id,
          state,
          dispatch: () => {},
        }),
      );
      expect(html).toContain("shop-media-slot");
      expect(html).toContain(file);
      expect(cardUrl).toContain(file);
    }
  });

  it("5tabすべて正式assetへ解決する", () => {
    for (const tab of SHOP_TABS) {
      const items = getShopTabItems(tab.id);
      expect(items.length).toBeGreaterThan(0);
      for (const item of items) {
        expect(getShopItemImageUrl(item)).not.toBeNull();
      }
    }
  });

  it("ShopMediaSlot contractを維持する(null時neutral / category iconなし)", () => {
    const html = renderToStaticMarkup(createElement(ShopMediaSlot, { src: null }));
    expect(html).toContain("shop-media-slot");
    expect(html).not.toContain("<img");
    expect(html).not.toContain("shop-item-card__icon");
  });
});
