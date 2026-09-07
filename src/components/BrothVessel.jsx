// 現在の出汁を表示する器コンポーネント(仕様8章)。
// 出汁IDから表示素材を解決する責務をここへ集約する: 本番画像がある出汁(現状は昆布のみ)は
// そのまま表示し、それ以外は無地の陶器SVG(未制作の絵柄を捏造しない)を表示する。
// 後の出汁商品美術工程で画像を追加する際は、data/itemImages.jsへ登録するだけでよい。
import { getBroth } from "../data/broths.js";
import { getBrothImageUrl } from "../data/itemImages.js";
import "./BrothVessel.css";

// サイズはCSS側(呼び出し元がラップするコンテナ)で制御する。ここでは常に
// コンテナいっぱいに描画されるようにするだけで、ブレイクポイント判断は持たない。
export function BrothVessel({ brothId, className = "" }) {
  const imageUrl = getBrothImageUrl(brothId);

  if (imageUrl) {
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

  const broth = getBroth(brothId);
  return (
    <svg
      viewBox="0 0 100 100"
      className={`broth-vessel broth-vessel--plain ${className}`}
      aria-hidden="true"
      role="img"
    >
      <ellipse cx="50" cy="90" rx="26" ry="4" fill="#3a2a12" opacity="0.12" />
      <path
        d="M21 40 Q21 19 50 19 Q79 19 79 40 L76 74 Q76 91 50 91 Q24 91 24 74 Z"
        fill="#f5ecd9"
        stroke="#c9b48a"
        strokeWidth="2.2"
      />
      <ellipse cx="50" cy="40" rx="28" ry="8.5" fill={broth.glow} opacity="0.9" />
      <ellipse cx="50" cy="40" rx="28" ry="8.5" fill="none" stroke="#c9b48a" strokeWidth="2" />
    </svg>
  );
}
