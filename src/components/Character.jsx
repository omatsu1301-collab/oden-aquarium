// UIコンポーネント: 大根・ちくわに共通する「タップ可能なキャラクター」の
// 描画とタップ反応(ぷるん/逃げ・タップ泡・きらめき)を担当する。
// 状態計算(soak等)は行わない。タップ状態は永続化しない(presentationのみ)。
//
// キャラクターごとの個性(浮遊の仕方・タップ反応の質感)はCSS側で
// floatClassName / tapClassName ごとに別のkeyframeとして定義し、
// このコンポーネント自体はどのキャラクターかを意識しない共通実装のまま保つ。
import { useRef, useState } from "react";

// タップ泡のオフセット・タイミングは固定配列(1タップあたり4個)。
// 大根・ちくわで共通利用する(タップ泡自体はキャラクター固有にしない)。
const TAP_BUBBLE_OFFSETS = [
  { left: "-14%", size: 4, duration: 0.8 },
  { left: "8%", size: 3, duration: 0.7 },
  { left: "22%", size: 5, duration: 0.9 },
  { left: "-2%", size: 3, duration: 0.75 },
];

// 連打してもDOM要素が無限に増えないための上限(1タップ4個 × 数タップ分)。
const MAX_TAP_BUBBLES = 24;

export function Character({
  floatClassName,
  tapClassName,
  image,
  alt,
  imgClassName,
  imgStyle,
}) {
  const tapRef = useRef(null);
  const fleeDirRef = useRef(1);
  const tapBubbleIdRef = useRef(0);
  const [tapBubbles, setTapBubbles] = useState([]);

  function handleTap() {
    const el = tapRef.current;
    if (el) {
      // 逃げる方向を毎回反転させ、単調にならないようにする。
      fleeDirRef.current *= -1;
      el.style.setProperty("--flee-dir", String(fleeDirRef.current));
      // 連打時も毎回反応が最初から再生されるよう、クラスを一度外して
      // reflowを強制してから付け直す(CSSアニメーション再起動の定石)。
      el.classList.remove("is-tapped");
      void el.offsetWidth;
      el.classList.add("is-tapped");
    }

    const newBubbles = TAP_BUBBLE_OFFSETS.map((offset) => ({
      id: tapBubbleIdRef.current++,
      ...offset,
    }));
    setTapBubbles((prev) => [...prev, ...newBubbles].slice(-MAX_TAP_BUBBLES));
  }

  function handleTapBubbleEnd(id) {
    setTapBubbles((prev) => prev.filter((bubble) => bubble.id !== id));
  }

  return (
    <div className={floatClassName}>
      <button
        type="button"
        ref={tapRef}
        onClick={handleTap}
        className={`aquarium-scene__tap ${tapClassName}`}
        aria-label={`${alt}(タップすると反応します)`}
      >
        <img
          src={image}
          alt={alt}
          className={`aquarium-scene__character ${imgClassName}`}
          style={imgStyle}
          draggable={false}
        />
        <span className="aquarium-scene__sparkle" aria-hidden="true" />
      </button>

      <div className="aquarium-scene__tap-bubbles" aria-hidden="true">
        {tapBubbles.map((bubble) => (
          <span
            key={bubble.id}
            className="aquarium-scene__tap-bubble"
            style={{
              left: bubble.left,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              animationDuration: `${bubble.duration}s`,
            }}
            onAnimationEnd={() => handleTapBubbleEnd(bubble.id)}
          />
        ))}
      </div>
    </div>
  );
}
