// 商店専用背景候補。共有NightBackdropは変更せず、その上へCSS装飾だけを重ねる。
import { NightBackdrop } from "./NightBackdrop.jsx";
import "./ShopBackdrop.css";

export function ShopBackdrop() {
  return (
    <>
      <NightBackdrop />
      <div className="shop-backdrop" aria-hidden="true">
        <div className="shop-backdrop__glow" />
        <div className="shop-backdrop__eave" />
        <div className="shop-backdrop__post shop-backdrop__post--left" />
        <div className="shop-backdrop__post shop-backdrop__post--right" />
      </div>
    </>
  );
}
