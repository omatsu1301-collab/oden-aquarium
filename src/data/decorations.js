// 飾り(decoration)の固定データ。仕様5.5。能力なし、見た目のみ。
// slotType: "tank"(水槽左下の景観枠、1点のみ) / "bowl"(図鑑の器、種類別に設定)。
export const TANK_DECORATION_ORDER = ["pebble", "kelp", "hideout", "lantern"];
export const BOWL_DECORATION_ORDER = ["bowl-white", "bowl-indigo", "bowl-cat", "bowl-black"];

export const DECORATIONS = {
  pebble: {
    id: "pebble",
    name: "まるい石",
    price: 100,
    slotType: "tank",
    tagline: "水底にころんと落ち着く。",
  },
  kelp: {
    id: "kelp",
    name: "昆布の林",
    price: 250,
    slotType: "tank",
    tagline: "ゆらゆらと影を作る。",
  },
  hideout: {
    id: "hideout",
    name: "陶器の隠れ家",
    price: 400,
    slotType: "tank",
    tagline: "小さな穴がひとつ。",
  },
  lantern: {
    id: "lantern",
    name: "小さな水中灯",
    price: 500,
    slotType: "tank",
    tagline: "水底をやわらく照らす。",
  },
  "bowl-white": {
    id: "bowl-white",
    name: "白い小鍋",
    price: 0,
    slotType: "bowl",
    initiallyOwned: true,
    tagline: "はじめからある、いつもの器。",
  },
  "bowl-indigo": {
    id: "bowl-indigo",
    name: "藍もようの小鍋",
    price: 250,
    slotType: "bowl",
    tagline: "涼しげな藍の模様。",
  },
  "bowl-cat": {
    id: "bowl-cat",
    name: "ねこ柄の小鍋",
    price: 350,
    slotType: "bowl",
    tagline: "ちいさな肉球の模様。",
  },
  "bowl-black": {
    id: "bowl-black",
    name: "黒釉の小鍋",
    price: 450,
    slotType: "bowl",
    tagline: "しっとりとした黒の釉薬。",
  },
};

export function getDecoration(decorationId) {
  return DECORATIONS[decorationId];
}
