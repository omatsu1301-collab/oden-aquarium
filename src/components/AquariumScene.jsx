// UIコンポーネント: 水槽の背景と、その上に配置したキャラクター画像の描画のみを担当する。
// soakProgressに応じた大根の見た目変化はCSS変数経由でCSS側に委譲し、
// このコンポーネント自体は状態計算を行わない。
import { getSoakVisualStyle } from "../presentation/soakVisual.js";
import "./AquariumScene.css";

// public/ 配下の静的アセットはビルド時のbase pathを反映するため、
// import ではなく import.meta.env.BASE_URL からURLを組み立てる
// (GitHub Pagesのプロジェクトページ配下でも404にならないようにするため)。
const backgroundImage = `${import.meta.env.BASE_URL}assets/backgrounds/aquarium-background.webp`;
const daikonImage = `${import.meta.env.BASE_URL}assets/characters/daikon.png`;
const chikuwaImage = `${import.meta.env.BASE_URL}assets/characters/chikuwa.png`;

export function AquariumScene({ soakProgress }) {
  return (
    <div className="aquarium-scene">
      <img
        src={backgroundImage}
        alt=""
        className="aquarium-scene__background"
        draggable={false}
      />
      <img
        src={daikonImage}
        alt="大根キャラクター"
        className="aquarium-scene__character aquarium-scene__daikon"
        style={getSoakVisualStyle(soakProgress)}
        draggable={false}
      />
      <img
        src={chikuwaImage}
        alt="ちくわキャラクター"
        className="aquarium-scene__character aquarium-scene__chikuwa"
        draggable={false}
      />
    </div>
  );
}
