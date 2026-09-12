// 商店用の商品画像URL。card/detail共通resolver。
// Full Product Art: 26商品すべて正式assetへ接続。src null / load失敗時のShopMediaSlot
// neutral fallback契約自体は維持する(category icon fallbackは使わない)。
import { getAssistImageUrl, getBrothImageUrl } from "../data/itemImages.js";
import { getBowlImageUrl } from "../data/bowlImages.js";

const ITEMS_DIR = "assets/items/";

const SHOP_ITEM_IMAGE_FILE = {
  clay: "pot-clay.webp",
  enamel: "pot-enamel.webp",
  copper: "pot-copper.webp",
  deep: "pot-deep.webp",
  "lid-wood": "tool-lid-wood.webp",
  "lid-ceramic": "tool-lid-ceramic.webp",
  paddle: "tool-paddle.webp",
  lamp: "tool-lamp.webp",
  pebble: "decoration-pebble.webp",
  kelp: "decoration-kelp.webp",
  hideout: "decoration-hideout.webp",
  lantern: "decoration-lantern.webp",
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
  if (SHOP_ITEM_IMAGE_FILE[item.id]) {
    return resolveItemUrl(SHOP_ITEM_IMAGE_FILE[item.id]);
  }
  return null;
}
