// 商店用の任意商品画像URL。未用意のカテゴリはnull(neutral media slotのみ)。
// Milestone 4 pilot: copper / paddle を追加。他は既存出汁・おたすけ・小鍋assetを再利用。
import { getAssistImageUrl, getBrothImageUrl } from "../data/itemImages.js";
import { getBowlImageUrl } from "../data/bowlImages.js";

const ITEMS_DIR = "assets/items/";

const SHOP_PILOT_IMAGE_FILE = {
  copper: "pot-copper.webp",
  paddle: "tool-paddle.webp",
};

function resolveItemUrl(file) {
  return file ? `${import.meta.env.BASE_URL}${ITEMS_DIR}${file}` : null;
}

export function getShopItemImageUrl(item) {
  if (!item) return null;
  if (item.category === "broth") return getBrothImageUrl(item.id);
  if (item.category === "assist") return getAssistImageUrl(item.id);
  if (item.category === "decoration" && item.slotType === "bowl") {
    return getBowlImageUrl(item.id);
  }
  if (SHOP_PILOT_IMAGE_FILE[item.id]) {
    return resolveItemUrl(SHOP_PILOT_IMAGE_FILE[item.id]);
  }
  return null;
}
