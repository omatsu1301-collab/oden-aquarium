// 商店専用背景(Wave 1C)。採用背景Cのscene＋woodを商店scopeだけで完結させる。
// 共有NightBackdrop / CatalogNightBackdropは変更・流用しない。
import "./ShopBackdrop.css";

const SCENE_URL = `${import.meta.env.BASE_URL}assets/shop/shop-artisan-night-scene.webp`;
const WOOD_URL = `${import.meta.env.BASE_URL}assets/shop/shop-artisan-night-wood.webp`;

export function ShopBackdrop() {
  return (
    <div className="shop-backdrop" aria-hidden="true">
      <div className="shop-backdrop__wood" style={{ backgroundImage: `url("${WOOD_URL}")` }} />
      <img src={SCENE_URL} alt="" className="shop-backdrop__scene" draggable={false} />
    </div>
  );
}
