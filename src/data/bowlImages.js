// 小鍋画像パスの定義(責務を一か所へ集約する、仕様8章)。
// 既知の4器IDだけを対応させ、未知IDは新しい正式商品として扱わずbowl-whiteへfallbackする。
const BOWLS_DIR = "assets/bowls/";

const BOWL_IMAGE_FILE = {
  "bowl-white": "bowl-white.webp",
  "bowl-indigo": "bowl-indigo.webp",
  "bowl-cat": "bowl-cat.webp",
  "bowl-black": "bowl-black.webp",
};

const FALLBACK_BOWL_ID = "bowl-white";

export function getBowlImageUrl(bowlId) {
  const file = BOWL_IMAGE_FILE[bowlId] ?? BOWL_IMAGE_FILE[FALLBACK_BOWL_ID];
  return `${import.meta.env.BASE_URL}${BOWLS_DIR}${file}`;
}
