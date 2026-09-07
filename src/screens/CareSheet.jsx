// お世話パネル(仕様6.5)。出汁名/残量/無料補充、消耗品一覧/個数/使用ボタン/使用中の残り時間。
import { Sheet } from "../ui/Sheet.jsx";
import { getBroth } from "../data/broths.js";
import { ASSIST_ORDER, getAssist } from "../data/assists.js";
import { getRemainingStatusLabel, getEffectRemainingMs, formatDurationShort } from "../game/selectors.js";
import "../ui/primitives.css";
import "./CareSheet.css";

export function CareSheet({ open, onClose, state, dispatch, onOpenShop }) {
  if (!state) return null;
  const broth = getBroth(state.tank.brothId);
  const remainingPercent = Math.round(state.tank.remainingRatio * 100);
  const remainingLabel = getRemainingStatusLabel(state);
  const isFull = state.tank.remainingRatio >= 1;

  function refill() {
    dispatch({ type: "REFILL_BROTH" });
  }

  function categoryActiveEffect(category) {
    return category === "growth" ? state.effects.growth : state.effects.care;
  }

  function handleUseAssist(assistId) {
    dispatch({ type: "USE_ASSIST", assistId });
  }

  return (
    <Sheet open={open} onClose={onClose} title="お世話" icon="🥄">
      <div className="care-sheet__broth card">
        <div className="care-sheet__broth-icon" aria-hidden="true">🍲</div>
        <div className="care-sheet__broth-info">
          <p className="care-sheet__broth-label">いまの出汁</p>
          <p className="care-sheet__broth-name">{broth.name}</p>
          <div className="progress-bar care-sheet__gauge">
            <div
              className={`progress-bar__fill${remainingPercent <= 25 ? " progress-bar__fill--low" : ""}`}
              style={{ width: `${remainingPercent}%` }}
            />
          </div>
          {remainingLabel && <p className="care-sheet__remaining-label">{remainingLabel}</p>}
        </div>
        <button
          type="button"
          className="btn btn--primary care-sheet__refill-btn"
          onClick={refill}
          disabled={isFull}
        >
          {isFull ? "たっぷり" : "出汁を足す"}
          <span className="care-sheet__refill-note">{isFull ? "" : "補充は無料"}</span>
        </button>
      </div>

      <hr className="section-divider" />
      <h3 className="care-sheet__section-title">おたすけ</h3>
      <ul className="care-sheet__assist-list">
        {ASSIST_ORDER.map((id) => {
          const assist = getAssist(id);
          const owned = state.inventory.consumables[id] ?? 0;
          const activeEffect = categoryActiveEffect(assist.category);
          const isThisActive = activeEffect?.itemId === id;
          const categoryBusy = Boolean(activeEffect) && !isThisActive;
          const careBlocked = assist.category === "care" && state.tank.remainingRatio <= 0;

          return (
            <li key={id} className="care-sheet__assist-item card">
              <span className="care-sheet__assist-icon" aria-hidden="true">
                {assist.category === "growth" ? "💧" : "🫙"}
              </span>
              <div className="care-sheet__assist-info">
                <p className="care-sheet__assist-name">
                  {assist.name} <span className="care-sheet__assist-count">×{owned}</span>
                </p>
                <p className="care-sheet__assist-tagline">{assist.tagline}</p>
              </div>
              {isThisActive ? (
                <span className="care-sheet__assist-active">使用中</span>
              ) : (
                <button
                  type="button"
                  className="btn"
                  disabled={owned <= 0 || categoryBusy || careBlocked}
                  onClick={() => handleUseAssist(id)}
                >
                  使う
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {(state.effects.growth || state.effects.care) && (
        <div className="care-sheet__effect-timers">
          {state.effects.growth && (
            <p className="care-sheet__timer">
              ⏱ {getAssist(state.effects.growth.itemId).name}{" "}
              {formatDurationShort(getEffectRemainingMs(state.effects.growth, state.lastSimulatedAt))}
            </p>
          )}
          {state.effects.care && (
            <p className="care-sheet__timer">
              ⏱ {getAssist(state.effects.care.itemId).name}{" "}
              {formatDurationShort(getEffectRemainingMs(state.effects.care, state.lastSimulatedAt))}
            </p>
          )}
        </div>
      )}

      <button type="button" className="btn btn--outline btn--block care-sheet__shop-link" onClick={onOpenShop}>
        商店でおたすけ・出汁を見る
      </button>
    </Sheet>
  );
}
