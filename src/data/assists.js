// おたすけ(消耗品)の固定データ。仕様5.4。effectCategory単位で同時使用不可。
// category(商店分類)は持たない。商店registryが category: "assist" を付与する。
export const ASSIST_ORDER = ["drop", "rich-drop", "care", "long-care"];

const MINUTES = 60 * 1000;
const HOURS = 60 * MINUTES;

export const ASSISTS = {
  drop: {
    id: "drop",
    name: "染みこみの一滴",
    price: 80,
    effectCategory: "growth",
    growthMultiplier: 1.5,
    durationMs: 30 * MINUTES,
    tagline: "しばらく、染みこみをお手伝い。",
    effectLabel: "成長×1.5を30分",
  },
  "rich-drop": {
    id: "rich-drop",
    name: "濃い染みこみの一滴",
    price: 180,
    effectCategory: "growth",
    growthMultiplier: 2,
    durationMs: 30 * MINUTES,
    tagline: "ぐっと濃く、染みこみをお手伝い。",
    effectLabel: "成長×2を30分",
  },
  care: {
    id: "care",
    name: "お留守番だし",
    price: 120,
    effectCategory: "care",
    durationMs: 4 * HOURS,
    tagline: "留守のあいだ、出汁を保つ。",
    effectLabel: "残量消費停止を4時間",
  },
  "long-care": {
    id: "long-care",
    name: "長持ちお留守番だし",
    price: 240,
    effectCategory: "care",
    durationMs: 12 * HOURS,
    tagline: "長い留守でも、出汁はそのまま。",
    effectLabel: "残量消費停止を12時間",
  },
};

export function getAssist(assistId) {
  return ASSISTS[assistId];
}
