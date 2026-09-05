// UIコンポーネント: 水槽の背景と、その上に配置したキャラクター画像の描画のみを担当する。
// 状態計算・アニメーション付与は行わない(Step 1: Static Vertical Slice)。
import "./AquariumScene.css";

// public/ 配下の静的アセットはビルド時のbase pathを反映するため、
// import ではなく import.meta.env.BASE_URL からURLを組み立てる
// (GitHub Pagesのプロジェクトページ配下でも404にならないようにするため)。
const backgroundImage = `${import.meta.env.BASE_URL}assets/backgrounds/aquarium-background.webp`;
const daikonImage = `${import.meta.env.BASE_URL}assets/characters/daikon.png`;
const chikuwaImage = `${import.meta.env.BASE_URL}assets/characters/chikuwa.png`;

export function AquariumScene() {
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
