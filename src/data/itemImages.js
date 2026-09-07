// 商品画像パスの定義(責務を一か所へ集約する、仕様5章)。
const ITEMS_DIR = "assets/items/";

const ASSIST_IMAGE_FILE = {
  drop: "assist-drop.webp",
  "rich-drop": "assist-rich-drop.webp",
  care: "assist-care.webp",
  "long-care": "assist-long-care.webp",
};

// 専用の絵柄を持つ出汁だけをここに列挙する。ここに無い出汁は全て
// NEUTRAL_BROTH_IMAGE_FILE(無地の共通陶器)を返す。今後かつお・味噌等の
// 専用画像が採用されたら、ここへ1行追加するだけで差し替えられる。
const BROTH_IMAGE_FILE = {
  kombu: "broth-kombu.webp",
};
const NEUTRAL_BROTH_IMAGE_FILE = "broth-neutral.webp";

function resolveUrl(file) {
  return file ? `${import.meta.env.BASE_URL}${ITEMS_DIR}${file}` : null;
}

export function getAssistImageUrl(assistId) {
  return resolveUrl(ASSIST_IMAGE_FILE[assistId]);
}

// 昆布だしは専用画像、それ以外の出汁は採用済みの無地陶器(broth-neutral.webp)を返す。
// 誤った絵柄(昆布の絵付け等)を他の出汁へ流用しない。
export function getBrothImageUrl(brothId) {
  return resolveUrl(BROTH_IMAGE_FILE[brothId] ?? NEUTRAL_BROTH_IMAGE_FILE);
}
