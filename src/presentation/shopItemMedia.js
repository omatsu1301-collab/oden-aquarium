// 商店用の任意商品画像URL。未用意のカテゴリはnull(neutral media slotのみ)。
// 新規画像は生成せず、既存の出汁・おたすけ・小鍋assetだけを返す。
import { getAssistImageUrl, getBrothImageUrl } from "../data/itemImages.js";
import { getBowlImageUrl } from "../data/bowlImages.js";

export function getShopItemImageUrl(item) {
  if (!item) return null;
  if (item.category === "broth") return getBrothImageUrl(item.id);
  if (item.category === "assist") return getAssistImageUrl(item.id);
  if (item.category === "decoration" && item.slotType === "bowl") {
    return getBowlImageUrl(item.id);
  }
  return null;
}
