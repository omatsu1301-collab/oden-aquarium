// 現在の出汁を表示する器コンポーネント(仕様8章)。
// 出汁IDから表示素材を解決する責務はdata/itemImages.jsへ集約し、ここは表示のみを担当する。
// 正式出汁6種は専用画像。未知IDのみ無地陶器(broth-neutral.webp)へfallbackする。
import { getBrothImageUrl } from "../data/itemImages.js";
import "./BrothVessel.css";

// サイズはCSS側(呼び出し元がラップするコンテナ)で制御する。ここでは常に
// コンテナいっぱいに描画されるようにするだけで、ブレイクポイント判断は持たない。
export function BrothVessel({ brothId, className = "" }) {
  const imageUrl = getBrothImageUrl(brothId);
  return (
    <img
      src={imageUrl}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`broth-vessel broth-vessel--image ${className}`}
    />
  );
}
