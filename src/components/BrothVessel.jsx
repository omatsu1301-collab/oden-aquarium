// 現在の出汁を表示する器コンポーネント(仕様8章)。
// 出汁IDから表示素材を解決する責務はdata/itemImages.jsへ集約し、ここは表示のみを担当する。
// 昆布だしは専用画像、それ以外は採用済みの無地陶器(broth-neutral.webp)を表示する
// (簡易SVG製フォールバックは廃止済み)。専用画像を追加する場合はitemImages.jsへ
// 登録するだけでよい。
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
