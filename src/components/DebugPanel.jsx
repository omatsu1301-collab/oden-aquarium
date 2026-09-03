// デバッグ用UI: `?debug=1` が付いたURLでのみ表示される。
// 本番ユーザーには見えない、時間送り操作を提供する。
import { MS_PER_HOUR } from "../constants.js";
import "./DebugPanel.css";

const ADVANCE_OPTIONS_HOURS = [1, 6, 24];

export function DebugPanel({ onAdvanceHours }) {
  return (
    <div className="debug-panel">
      <div className="debug-panel__label">デバッグ: 時間を進める</div>
      <div className="debug-panel__buttons">
        {ADVANCE_OPTIONS_HOURS.map((hours) => (
          <button
            key={hours}
            type="button"
            className="debug-panel__button"
            onClick={() => onAdvanceHours(hours * MS_PER_HOUR)}
          >
            +{hours}時間
          </button>
        ))}
      </div>
    </div>
  );
}
