// 水槽画面(仕様6.2)。01-aquarium.pngの構図を守り、既存の背景/浮遊/反応を再利用する。
import { AquariumScene } from "../components/AquariumScene.jsx";
import { getRemainingStatusLabel, isSlotMature } from "../game/selectors.js";
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
        <span className="tank-screen__brand">🌿 だし水槽</span>
        <div className="tank-screen__topbar-actions">
          <button type="button" className="tank-screen__icon-btn" onClick={onOpenLetters} aria-label="お願い・おたより">
            ✉️
          </button>
          <button type="button" className="tank-screen__icon-btn" onClick={onOpenSettings} aria-label="設定">
            ⚙️
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
          <span aria-hidden="true">✨ </span>
          {message}
        </span>
        <button type="button" className="tank-screen__care-btn" onClick={onOpenCare}>
          🥄 お世話
        </button>
      </div>
    </div>
  );
}
