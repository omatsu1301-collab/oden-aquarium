// 商店card/detail共通の固定aspect media slot。画像なし・読込失敗時もneutral surfaceを保ちCLSを避ける。
import { useState } from "react";
import "./ShopMediaSlot.css";

export function ShopMediaSlot({ src = null, className = "" }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <div className={`shop-media-slot${className ? ` ${className}` : ""}`} aria-hidden="true">
      {showImage ? (
        <img
          src={src}
          alt=""
          draggable={false}
          className="shop-media-slot__image"
          onError={() => setFailed(true)}
        />
      ) : null}
    </div>
  );
}
