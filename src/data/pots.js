// 鍋(pot)の固定データ。仕様5.2。
export const POT_ORDER = ["clay", "enamel", "copper", "deep"];

export const POTS = {
  clay: {
    id: "clay",
    name: "素焼き鍋",
    price: 0,
    initiallyOwned: true,
    slots: 5,
    fullHours: 8,
    speedMultiplier: 1,
    tagline: "基準の水槽。",
  },
  enamel: {
    id: "enamel",
    name: "ほうろう鍋",
    price: 450,
    initiallyOwned: false,
    slots: 5,
    fullHours: 10,
    speedMultiplier: 1,
    tagline: "上端と底に控えめな乳白色の縁。",
  },
  copper: {
    id: "copper",
    name: "銅鍋",
    price: 900,
    initiallyOwned: false,
    slots: 5,
    fullHours: 8,
    speedMultiplier: 1.15,
    tagline: "赤銅色の細い縁と底の反射。",
  },
  deep: {
    id: "deep",
    name: "深い土鍋",
    price: 1200,
    initiallyOwned: false,
    slots: 6,
    fullHours: 12,
    speedMultiplier: 1,
    tagline: "茶の陶器の縁と底。",
  },
};

export function getPot(potId) {
  return POTS[potId];
}
