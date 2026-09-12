// 商品画像パスの定義(責務を一か所へ集約する、仕様5章)。
const ITEMS_DIR = "assets/items/";

const ASSIST_IMAGE_FILE = {
  drop: "assist-drop.webp",
  "rich-drop": "assist-rich-drop.webp",
  care: "assist-care.webp",
  "long-care": "assist-long-care.webp",
};

// 出汁6種すべて専用asset。未知IDのみ無地陶器へfallbackする。
const BROTH_IMAGE_FILE = {
  kombu: "broth-kombu.webp",
  katsuo: "broth-katsuo.webp",
  miso: "broth-miso.webp",
  soy: "broth-soy.webp",
  salt: "broth-salt.webp",
  yuzu: "broth-yuzu.webp",
};
const NEUTRAL_BROTH_IMAGE_FILE = "broth-neutral.webp";

function resolveUrl(file) {
  return file ? `${import.meta.env.BASE_URL}${ITEMS_DIR}${file}` : null;
}

export function getAssistImageUrl(assistId) {
  return resolveUrl(ASSIST_IMAGE_FILE[assistId]);
}

// 正式出汁は専用画像。未知IDのみ採用済み無地陶器へfallbackし、誤った絵柄の流用を防ぐ。
export function getBrothImageUrl(brothId) {
  return resolveUrl(BROTH_IMAGE_FILE[brothId] ?? NEUTRAL_BROTH_IMAGE_FILE);
}
