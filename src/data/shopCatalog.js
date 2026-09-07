// 商店5売り場の集約。各カテゴリのデータをUI/購入ロジックが共通に扱えるようにする。
import { BROTHS, BROTH_ORDER } from "./broths.js";
import { POTS, POT_ORDER } from "./pots.js";
import { TOOLS, TOOL_ORDER } from "./tools.js";
import { ASSISTS, ASSIST_ORDER } from "./assists.js";
import { DECORATIONS, TANK_DECORATION_ORDER, BOWL_DECORATION_ORDER } from "./decorations.js";

export const SHOP_TABS = [
  { id: "broth", label: "出汁", lead: "出汁を変えると、新しい出会い。" },
  { id: "pot", label: "鍋", lead: "鍋を変えると、水槽の表情が変わる。" },
  { id: "tool", label: "道具", lead: "小さな工夫で、お世話がらくに。" },
  { id: "assist", label: "おたすけ", lead: "ここぞという時に。" },
  { id: "decoration", label: "飾り", lead: "見た目だけの、ささやかな贅沢。" },
];

// カテゴリ横断で価格/名称/所有種別を引けるようにする単一のfrom-data定義。
const REGISTRY = {};
function register(category, order, table, kind) {
  for (const id of order) {
    REGISTRY[id] = { ...table[id], category, kind };
  }
}
register("broth", BROTH_ORDER, BROTHS, "permanent");
register("pot", POT_ORDER, POTS, "permanent");
register("tool", TOOL_ORDER, TOOLS, "permanent");
register("assist", ASSIST_ORDER, ASSISTS, "consumable");
register(
  "decoration",
  [...TANK_DECORATION_ORDER, ...BOWL_DECORATION_ORDER],
  DECORATIONS,
  "permanent",
);

export function getShopItem(itemId) {
  return REGISTRY[itemId];
}

export function getShopTabItems(tabId) {
  switch (tabId) {
    case "broth":
      return BROTH_ORDER.map((id) => REGISTRY[id]);
    case "pot":
      return POT_ORDER.map((id) => REGISTRY[id]);
    case "tool":
      return TOOL_ORDER.map((id) => REGISTRY[id]);
    case "assist":
      return ASSIST_ORDER.map((id) => REGISTRY[id]);
    case "decoration":
      return [...TANK_DECORATION_ORDER, ...BOWL_DECORATION_ORDER].map((id) => REGISTRY[id]);
    default:
      return [];
  }
}

export function getInitiallyOwnedIds() {
  return Object.values(REGISTRY)
    .filter((item) => item.initiallyOwned)
    .map((item) => item.id);
}

export const ALL_ITEM_COUNT = Object.keys(REGISTRY).length;
