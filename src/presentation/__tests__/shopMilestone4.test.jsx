import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getShopItem } from "../../data/shopCatalog.js";
import { getShopItemImageUrl } from "../shopItemMedia.js";
import { ShopItemCard } from "../../screens/ShopScreen.jsx";
import { ShopItemDetailSheet } from "../../screens/ShopItemDetailSheet.jsx";
import { createInitialGameState } from "../../game/state.js";

const T0 = 1_700_000_000_000;

const PILOT = [
  ["kombu", "broth-kombu.webp"],
  ["copper", "pot-copper.webp"],
  ["paddle", "tool-paddle.webp"],
  ["drop", "assist-drop.webp"],
  ["bowl-indigo", "bowl-indigo.webp"],
];

describe("Milestone 4 product art pilot mapping", () => {
  it("代表5商品がcard/detail共通mappingで解決される", () => {
    for (const [id, file] of PILOT) {
      const url = getShopItemImageUrl(getShopItem(id));
      expect(url).toContain(file);
      expect(url).toContain(import.meta.env.BASE_URL);
    }
  });

  it("pilot以外の鍋・道具はneutralのまま", () => {
    expect(getShopItemImageUrl(getShopItem("clay"))).toBeNull();
    expect(getShopItemImageUrl(getShopItem("enamel"))).toBeNull();
    expect(getShopItemImageUrl(getShopItem("lamp"))).toBeNull();
  });

  it("代表5商品のcardはmedia slot内にimg srcを持つ", () => {
    const state = createInitialGameState(T0, 1);
    for (const [id, file] of PILOT) {
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

  it("代表5商品のdetailも同じassetを表示する", () => {
    const state = { ...createInitialGameState(T0, 1), wallet: 5000 };
    for (const [id, file] of PILOT) {
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
    }
  });
});
