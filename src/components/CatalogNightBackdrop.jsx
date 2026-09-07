// 図鑑専用の夜屋台背景(美術改善パス2 7章)。既存NightBackdrop/ShopScreenは無変更のまま、
// この画面だけで採用マスター由来のcatalog-night.webpを使う。
// .catalog-screen__content(スクロールする実コンテンツ)の内側へ配置し、
// コンテンツと同じ高さ(=総スクロール量)に伸びることで、木棚とカード行のずれを防ぐ。
// 画像より内容が長い場合は、コンテナ自身のbackground-color(木色)が自然に延長される。
import "./CatalogNightBackdrop.css";

const IMAGE_URL = `${import.meta.env.BASE_URL}assets/backgrounds/catalog-night.webp`;

export function CatalogNightBackdrop() {
  return (
    <div className="catalog-night-backdrop" aria-hidden="true">
      <img src={IMAGE_URL} alt="" className="catalog-night-backdrop__image" draggable={false} />
    </div>
  );
}
