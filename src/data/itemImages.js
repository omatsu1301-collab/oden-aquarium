// 商品画像パスの定義(責務を一か所へ集約する、仕様5章)。
// 採用済みの本番WebPを持つ商品のみここに列挙する。ここに無いIDは画像を持たない
// (呼び出し側がプレースホルダー/フォールバック表示を選ぶ)。
const ITEMS_DIR = "assets/items/";

const ASSIST_IMAGE_FILE = {
  drop: "assist-drop.webp",
  "rich-drop": "assist-rich-drop.webp",
  care: "assist-care.webp",
  "long-care": "assist-long-care.webp",
};

// 今回本番化した出汁は昆布だしのみ。他の出汁の絵柄は未制作のため、
// ここに追加しない限り誤った絵柄(昆布の絵付け)を流用しないこと。
const BROTH_IMAGE_FILE = {
  kombu: "broth-kombu.webp",
};

function resolveUrl(file) {
  return file ? `${import.meta.env.BASE_URL}${ITEMS_DIR}${file}` : null;
}

export function getAssistImageUrl(assistId) {
  return resolveUrl(ASSIST_IMAGE_FILE[assistId]);
}

export function getBrothImageUrl(brothId) {
  return resolveUrl(BROTH_IMAGE_FILE[brothId]);
}
