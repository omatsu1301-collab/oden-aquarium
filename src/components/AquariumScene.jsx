// UIコンポーネント: 水槽の背景と、その上に配置したキャラクター画像の描画のみを担当する。
// soakProgressに応じた大根の見た目変化はCSS変数経由でCSS側に委譲し、
// このコンポーネント自体は状態計算を行わない。
// 浮遊・泡・光ゆらぎ・タップ反応もCSSアニメーションのみで実現し、
// 新規ゲームロジック・永続化は持たない(タップ状態は保存しない)。
import { useRef, useState } from "react";
import { getSoakVisualStyle } from "../presentation/soakVisual.js";
import "./AquariumScene.css";

// public/ 配下の静的アセットはビルド時のbase pathを反映するため、
// import ではなく import.meta.env.BASE_URL からURLを組み立てる
// (GitHub Pagesのプロジェクトページ配下でも404にならないようにするため)。
const backgroundImage = `${import.meta.env.BASE_URL}assets/backgrounds/aquarium-background.webp`;
const daikonImage = `${import.meta.env.BASE_URL}assets/characters/daikon.png`;
const chikuwaImage = `${import.meta.env.BASE_URL}assets/characters/chikuwa.png`;

// 泡の見た目・タイミングは固定配列でばらけさせる(再レンダーのたびに
// ランダム値が変わって位置が飛ばないよう、乱数は使わない)。
const BUBBLES = [
  { left: "8%", size: 5, duration: 7.2, delay: -1.4, rise: "-88vh", opacity: 0.35 },
  { left: "18%", size: 3, duration: 6.1, delay: -4.8, rise: "-92vh", opacity: 0.25 },
  { left: "30%", size: 6, duration: 8.4, delay: -2.9, rise: "-85vh", opacity: 0.4 },
  { left: "42%", size: 4, duration: 6.8, delay: -0.6, rise: "-90vh", opacity: 0.3 },
  { left: "58%", size: 3, duration: 7.9, delay: -5.6, rise: "-93vh", opacity: 0.28 },
  { left: "68%", size: 5, duration: 6.5, delay: -3.3, rise: "-87vh", opacity: 0.38 },
  { left: "78%", size: 4, duration: 8.9, delay: -1.9, rise: "-91vh", opacity: 0.32 },
  { left: "88%", size: 6, duration: 7.5, delay: -4.1, rise: "-86vh", opacity: 0.42 },
  { left: "50%", size: 3, duration: 9.3, delay: -6.4, rise: "-94vh", opacity: 0.22 },
];

// タップ泡のオフセット・タイミングは固定配列(1タップあたり4個)。
const TAP_BUBBLE_OFFSETS = [
  { left: "-14%", size: 4, duration: 0.8 },
  { left: "8%", size: 3, duration: 0.7 },
  { left: "22%", size: 5, duration: 0.9 },
  { left: "-2%", size: 3, duration: 0.75 },
];

// 連打してもDOM要素が無限に増えないための上限(1タップ4個 × 数タップ分)。
const MAX_TAP_BUBBLES = 24;

export function AquariumScene({ soakProgress }) {
  const daikonTapRef = useRef(null);
  const fleeDirRef = useRef(1);
  const tapBubbleIdRef = useRef(0);
  const [tapBubbles, setTapBubbles] = useState([]);

  function handleTapDaikon() {
    const el = daikonTapRef.current;
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
    <div className="aquarium-scene">
      <img
        src={backgroundImage}
        alt=""
        className="aquarium-scene__background"
        draggable={false}
      />

      <div className="aquarium-scene__bubbles" aria-hidden="true">
        {BUBBLES.map((bubble, index) => (
          <span
            key={index}
            className="aquarium-scene__bubble"
            style={{
              left: bubble.left,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              animationDuration: `${bubble.duration}s`,
              animationDelay: `${bubble.delay}s`,
              "--bubble-rise": bubble.rise,
              "--bubble-opacity": bubble.opacity,
            }}
          />
        ))}
      </div>

      <div className="aquarium-scene__daikon-float">
        <button
          type="button"
          ref={daikonTapRef}
          onClick={handleTapDaikon}
          className="aquarium-scene__daikon-tap"
          aria-label="大根キャラクター(タップすると反応します)"
        >
          <img
            src={daikonImage}
            alt="大根キャラクター"
            className="aquarium-scene__character aquarium-scene__daikon"
            style={getSoakVisualStyle(soakProgress)}
            draggable={false}
          />
          <span className="aquarium-scene__daikon-sparkle" aria-hidden="true" />
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

      <div className="aquarium-scene__chikuwa-float">
        <img
          src={chikuwaImage}
          alt="ちくわキャラクター"
          className="aquarium-scene__character aquarium-scene__chikuwa"
          draggable={false}
        />
      </div>
    </div>
  );
}
