// 水槽画面(仕様6.2)。01-aquarium.pngの構図を守り、既存の背景/浮遊/反応を再利用する。
// 美術改善パス1: 上部・状態欄の絵文字を共通線画SVGへ置換(背景/浮遊/タップ反応/配置は無変更)。
import { AquariumScene } from "../components/AquariumScene.jsx";
import { getRemainingStatusLabel, isSlotMature } from "../game/selectors.js";
import { SeaweedIcon, EnvelopeIcon, GearIcon, SparkleIcon, LadleIcon } from "../icons/Icons.jsx";
import "./TankScreen.css";

export function TankScreen({ state, dispatch, onOpenCare, onOpenLetters, onOpenSettings }) {
  function handleHarvest(instanceId) {
    dispatch({ type: "HARVEST", instanceId });
  }

  const remainingLabel = getRemainingStatusLabel(state);
  const hasMature = state.slots.some(isSlotMature);
  const message = remainingLabel ?? (hasMature ? "いい具合に染みた子がいるよ" : "今日ものんびり染み中");

  const showTutorialHint = !state.tutorial.firstHarvestHintShown;

  return (
    <div className="tank-screen">
      <div className="tank-screen__topbar">
        <span className="tank-screen__brand">
          <SeaweedIcon aria-hidden="true" className="tank-screen__brand-icon" />
          だし水槽
        </span>
        <div className="tank-screen__topbar-actions">
          <button type="button" className="tank-screen__icon-btn" onClick={onOpenLetters} aria-label="お願い・おたより">
            <EnvelopeIcon aria-hidden="true" />
          </button>
          <button type="button" className="tank-screen__icon-btn" onClick={onOpenSettings} aria-label="設定">
            <GearIcon aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="tank-screen__scene">
        <AquariumScene slots={state.slots} onHarvest={handleHarvest} decorationId={state.tank.decorationId} />
        {showTutorialHint && (
          <div className="tank-screen__tutorial-hint" role="status">
            染みた子をタップして、すくってみよう
          </div>
        )}
      </div>

      <div className="tank-screen__status-bar">
        <span className="tank-screen__status-text">
          <SparkleIcon aria-hidden="true" className="tank-screen__status-icon" />
          {message}
        </span>
        <button type="button" className="tank-screen__care-btn" onClick={onOpenCare}>
          <LadleIcon aria-hidden="true" />
          お世話
        </button>
      </div>
    </div>
  );
}
