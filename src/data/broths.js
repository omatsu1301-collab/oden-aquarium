// 出汁(broth)の固定データ。速度には影響せず、水槽の色と次個体抽選の重みだけを変える。
// weights: 記載speciesは重み3、その他は重み1(仕様5.1)。
import { SPECIES_ORDER } from "./species.js";

function weightsWithFavorite(favoriteSpeciesId) {
  const weights = {};
  for (const id of SPECIES_ORDER) {
    weights[id] = id === favoriteSpeciesId ? 3 : 1;
  }
  return weights;
}

export const BROTH_ORDER = ["kombu", "katsuo", "miso", "soy", "salt", "yuzu"];

export const BROTHS = {
  kombu: {
    id: "kombu",
    name: "昆布だし",
    price: 0,
    initiallyOwned: true,
    tagline: "やさしい、いつもの味。",
    colorLabel: "現在の黄金色",
    tint: "rgba(255, 214, 120, 0)",
    glow: "#ffd678",
    weights: weightsWithFavorite(null),
  },
  katsuo: {
    id: "katsuo",
    name: "かつおだし",
    price: 300,
    initiallyOwned: false,
    tagline: "ふわり、香りひろがる。",
    colorLabel: "琥珀",
    tint: "rgba(199, 120, 34, 0.16)",
    glow: "#c77a2c",
    weights: weightsWithFavorite("chikuwa"),
  },
  miso: {
    id: "miso",
    name: "味噌だし",
    price: 500,
    initiallyOwned: false,
    tagline: "こっくり、あたたかい。",
    colorLabel: "赤褐色を薄く",
    tint: "rgba(150, 66, 48, 0.18)",
    glow: "#a8543a",
    weights: weightsWithFavorite("ganmo"),
  },
  soy: {
    id: "soy",
    name: "豆乳だし",
    price: 500,
    initiallyOwned: false,
    tagline: "まろやかな、白い世界。",
    colorLabel: "乳白色の光",
    tint: "rgba(255, 248, 232, 0.28)",
    glow: "#fff6e0",
    weights: weightsWithFavorite("shirataki"),
  },
  salt: {
    id: "salt",
    name: "塩だし",
    price: 700,
    initiallyOwned: false,
    tagline: "澄んだ、すっきり仕立て。",
    colorLabel: "透明な淡い金色",
    tint: "rgba(255, 236, 190, 0.1)",
    glow: "#ffe9b0",
    weights: weightsWithFavorite("konnyaku"),
  },
  yuzu: {
    id: "yuzu",
    name: "ゆずだし",
    price: 900,
    initiallyOwned: false,
    tagline: "ほのかに、柑橘の香り。",
    colorLabel: "淡い黄色",
    tint: "rgba(230, 214, 90, 0.16)",
    glow: "#e6d65a",
    weights: weightsWithFavorite("daikon"),
  },
};

export function getBroth(brothId) {
  return BROTHS[brothId];
}

// 個体の出生時brothIdに応じた重み付き抽選。
// randomValueは呼び出し側(game/engine.js)がstepRngで進めた[0,1)の値を渡す(副作用なし)。
export function drawSpeciesId(brothId, randomValue) {
  const weights = getBroth(brothId).weights;
  const entries = SPECIES_ORDER.map((id) => [id, weights[id]]);
  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = randomValue * total;
  for (const [id, w] of entries) {
    roll -= w;
    if (roll < 0) return id;
  }
  return entries[entries.length - 1][0];
}
