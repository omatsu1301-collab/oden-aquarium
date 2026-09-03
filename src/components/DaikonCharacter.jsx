// UIコンポーネント: 大根キャラクターの見た目と浮遊アニメーションの描画のみを担当する。
// 状態計算(dashiLevelの算出)は行わない。
import daikonImage from "../assets/daikon.svg";
import "./DaikonCharacter.css";

export function DaikonCharacter() {
  return (
    <div className="daikon-character">
      <img src={daikonImage} alt="大根キャラクター" className="daikon-character__image" draggable={false} />
    </div>
  );
}
