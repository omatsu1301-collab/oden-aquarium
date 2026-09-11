import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  ShopAssistIcon,
  ShopBrothIcon,
  ShopDecorationIcon,
  ShopPotIcon,
  ShopToolIcon,
} from "../../icons/Icons.jsx";
import { SHOP_TABS, getShopItem } from "../../data/shopCatalog.js";
import { ShopBackdrop } from "../../components/ShopBackdrop.jsx";
import { CatalogNightBackdrop } from "../../components/CatalogNightBackdrop.jsx";
import { NightBackdrop } from "../../components/NightBackdrop.jsx";
import { SHOP_CATEGORY_ICONS } from "../../presentation/shopCategoryIcons.js";
import { ShopItemCard, ShopScreen } from "../ShopScreen.jsx";

const KOMBU = getShopItem("kombu");

function makeState(overrides = {}) {
  return {
    wallet: 300,
    tank: {
      brothId: "kombu",
      potId: "clay",
      tools: { lid: null, paddle: false, lamp: false },
      decorationId: null,
      remainingRatio: 1,
    },
    inventory: { ownedIds: ["kombu", "clay", "bowl-white"], consumables: {} },
    effects: { growth: null, care: null },
    ...overrides,
  };
}

describe("Wave 1C shop category icons", () => {
  const cases = [
    ["broth", ShopBrothIcon],
    ["pot", ShopPotIcon],
    ["tool", ShopToolIcon],
    ["assist", ShopAssistIcon],
    ["decoration", ShopDecorationIcon],
  ];

  it("5category tabへadopted SVGを割り当てる", () => {
    for (const [id, Icon] of cases) {
      expect(SHOP_CATEGORY_ICONS[id]).toBe(Icon);
    }
    expect(SHOP_TABS.map((tab) => tab.id)).toEqual([
      "broth",
      "pot",
      "tool",
      "assist",
      "decoration",
    ]);
    expect(SHOP_TABS.map((tab) => tab.label)).toEqual([
      "出汁",
      "鍋",
      "道具",
      "おたすけ",
      "飾り",
    ]);
  });

  it.each(cases)("%s iconは24×24 viewBoxとcurrentColor contractを守る", (_id, Icon) => {
    for (const size of [16, 20, 24]) {
      const html = renderToStaticMarkup(createElement(Icon, { size, "aria-hidden": true }));
      expect(html).toContain('viewBox="0 0 24 24"');
      expect(html).toContain('stroke="currentColor"');
      expect(html).toContain('stroke-linecap="round"');
      expect(html).toContain('stroke-linejoin="round"');
      expect(html).toContain(`width="${size}"`);
      expect(html).toContain(`height="${size}"`);
      expect(html).toContain("aria-hidden");
    }
  });
});

describe("Wave 1C ShopScreen contracts", () => {
  it("初期選択tabはaria-pressed=trueで、5labelを表示する", () => {
    const html = renderToStaticMarkup(
      createElement(ShopScreen, {
        state: makeState(),
        onOpenItemDetail: () => {},
      }),
    );
    expect(html).toContain("aria-pressed=\"true\"");
    for (const label of ["出汁", "鍋", "道具", "おたすけ", "飾り"]) {
      expect(html).toContain(label);
    }
  });

  it("商品cardはneutral media slotを持ち、category iconやimgを出さない", () => {
    const html = renderToStaticMarkup(
      createElement(ShopItemCard, {
        item: KOMBU,
        state: makeState(),
        onOpen: () => {},
      }),
    );
    expect(html).toContain("shop-item-card__media");
    expect(html).not.toContain("<img");
    expect(html).not.toContain("shop-item-card__icon");
    expect(html).not.toContain("viewBox");
  });

  it("商品card clickで既存detail openへitem.idを渡す", () => {
    let opened = null;
    const element = ShopItemCard({
      item: KOMBU,
      state: makeState(),
      onOpen: (id) => {
        opened = id;
      },
    });
    expect(element.type).toBe("button");
    element.props.onClick();
    expect(opened).toBe("kombu");
  });

  it("4statusのclassをcardへ残す", () => {
    const active = renderToStaticMarkup(
      createElement(ShopItemCard, {
        item: KOMBU,
        state: makeState(),
        onOpen: () => {},
      }),
    );
    expect(active).toContain("is-active");
    expect(active).toContain("使用中");

    const shortfallItem = getShopItem("yuzu");
    const shortfall = renderToStaticMarkup(
      createElement(ShopItemCard, {
        item: shortfallItem,
        state: makeState({ wallet: 0 }),
        onOpen: () => {},
      }),
    );
    expect(shortfall).toContain("is-shortfall");
    expect(shortfall).toContain("残高不足");
  });
});

describe("Wave 1C backdrop separation", () => {
  it("ShopBackdropは商店assetを使い、Catalog/Nightと別物である", () => {
    const shop = renderToStaticMarkup(createElement(ShopBackdrop));
    const catalog = renderToStaticMarkup(createElement(CatalogNightBackdrop));
    const night = renderToStaticMarkup(createElement(NightBackdrop));

    expect(shop).toContain("assets/shop/shop-artisan-night-scene.webp");
    expect(shop).toContain("shop-artisan-night-wood.webp");
    expect(shop).toContain("shop-backdrop");
    expect(shop).not.toContain("catalog-night");
    expect(catalog).toContain("catalog-night");
    expect(catalog).not.toContain("shop-artisan-night");
    expect(night).not.toContain("shop-artisan-night");
    expect(ShopBackdrop).not.toBe(CatalogNightBackdrop);
    expect(ShopBackdrop).not.toBe(NightBackdrop);
  });
});
