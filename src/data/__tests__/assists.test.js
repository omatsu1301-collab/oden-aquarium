import { describe, expect, it } from "vitest";
import { ASSISTS, ASSIST_ORDER } from "../assists.js";
import { getShopItem } from "../shopCatalog.js";

describe("assist データ契約: 商店分類と効果分類の分離", () => {
  it("4商品すべて、商店registry上のcategoryはassistで、effectCategoryを保持する", () => {
    for (const id of ASSIST_ORDER) {
      const item = getShopItem(id);
      expect(item.category).toBe("assist");
      expect(item.effectCategory).toBe(ASSISTS[id].effectCategory);
      expect(item.kind).toBe("consumable");
    }
  });

  it("drop / rich-drop の effectCategory は growth", () => {
    expect(ASSISTS.drop.effectCategory).toBe("growth");
    expect(ASSISTS["rich-drop"].effectCategory).toBe("growth");
    expect(getShopItem("drop").effectCategory).toBe("growth");
    expect(getShopItem("rich-drop").effectCategory).toBe("growth");
  });

  it("care / long-care の effectCategory は care", () => {
    expect(ASSISTS.care.effectCategory).toBe("care");
    expect(ASSISTS["long-care"].effectCategory).toBe("care");
    expect(getShopItem("care").effectCategory).toBe("care");
    expect(getShopItem("long-care").effectCategory).toBe("care");
  });

  it("静的assist定義に効果分類目的のcategoryは残っていない", () => {
    for (const id of ASSIST_ORDER) {
      expect(ASSISTS[id]).not.toHaveProperty("category");
    }
  });
});
