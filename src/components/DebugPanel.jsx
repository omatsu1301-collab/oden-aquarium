// デバッグ用UI: `?debug=1` が付いたURLでのみ表示される。
// 本番ユーザーには見えない、時間送り操作とsoakProgress強制表示を提供する。
import { MS_PER_HOUR } from "../constants.js";
import "./DebugPanel.css";

const ADVANCE_OPTIONS_HOURS = [1, 6, 24];
const SOAK_PREVIEW_OPTIONS = [0, 50, 100];

export function DebugPanel({ onAdvanceHours, soakOverride, onSetSoakOverride }) {
  return (
    <div className="debug-panel">
      <div className="debug-panel__section">
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
      <div className="debug-panel__section">
        <div className="debug-panel__label">
          デバッグ: soakProgress強制表示(保存には影響しません)
        </div>
        <div className="debug-panel__buttons">
          {SOAK_PREVIEW_OPTIONS.map((value) => (
            <button
              key={value}
              type="button"
              className="debug-panel__button"
              aria-pressed={soakOverride === value}
              onClick={() => onSetSoakOverride(value)}
            >
              {value}%
            </button>
          ))}
          <button
            type="button"
            className="debug-panel__button"
            disabled={soakOverride === null}
            onClick={() => onSetSoakOverride(null)}
          >
            実際の値に戻す
          </button>
        </div>
      </div>
    </div>
  );
}
