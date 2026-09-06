// UIコンポーネント: 水槽の背景・常時泡・キャラクター配置を担当する。
// soakProgressに応じた大根の見た目変化はCSS変数経由でCSS側に委譲し、
// このコンポーネント自体は状態計算を行わない。
// キャラクターの浮遊・タップ反応の共通実装はCharacterコンポーネントへ分離し、
// ここではキャラクターごとの配置(asset・position・personality用クラス名)のみを渡す。
import { getSoakVisualStyle } from "../presentation/soakVisual.js";
import { Character } from "./Character.jsx";
import "./AquariumScene.css";

// public/ 配下の静的アセットはビルド時のbase pathを反映するため、
// import ではなく import.meta.env.BASE_URL からURLを組み立てる
// (GitHub Pagesのプロジェクトページ配下でも404にならないようにするため)。
const backgroundImage = `${import.meta.env.BASE_URL}assets/backgrounds/aquarium-background.webp`;
const daikonImage = `${import.meta.env.BASE_URL}assets/characters/daikon.png`;
const chikuwaImage = `${import.meta.env.BASE_URL}assets/characters/chikuwa.png`;
const shiratakiImage = `${import.meta.env.BASE_URL}assets/characters/shirataki.png`;
const konnyakuImage = `${import.meta.env.BASE_URL}assets/characters/konnyaku.png`;
const ganmoImage = `${import.meta.env.BASE_URL}assets/characters/ganmo.png`;

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

export function AquariumScene({ soakProgress }) {
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

      {/* soak表現(dashiLevel由来)を持つのは今のところ大根のみ。
          ちくわはまだsoak visualを持たないため imgStyle を渡さない。 */}
      <Character
        floatClassName="aquarium-scene__daikon-float"
        tapClassName="aquarium-scene__daikon-tap"
        image={daikonImage}
        alt="大根キャラクター"
        imgClassName="aquarium-scene__daikon"
        imgStyle={getSoakVisualStyle(soakProgress)}
      />

      <Character
        floatClassName="aquarium-scene__chikuwa-float"
        tapClassName="aquarium-scene__chikuwa-tap"
        image={chikuwaImage}
        alt="ちくわキャラクター"
        imgClassName="aquarium-scene__chikuwa"
      />

      <Character
        floatClassName="aquarium-scene__shirataki-float"
        tapClassName="aquarium-scene__shirataki-tap"
        image={shiratakiImage}
        alt="しらたきキャラクター"
        imgClassName="aquarium-scene__shirataki"
      />

      <Character
        floatClassName="aquarium-scene__konnyaku-float"
        tapClassName="aquarium-scene__konnyaku-tap"
        image={konnyakuImage}
        alt="こんにゃくキャラクター"
        imgClassName="aquarium-scene__konnyaku"
      />

      <Character
        floatClassName="aquarium-scene__ganmo-float"
        tapClassName="aquarium-scene__ganmo-tap"
        image={ganmoImage}
        alt="がんもキャラクター"
        imgClassName="aquarium-scene__ganmo"
      />
    </div>
  );
}
