// お世話パネル(仕様6.5/美術改善パス1の8章)。出汁名/残量/無料補充、消耗品一覧/個数/
// 使用ボタン/使用中の残り時間。ゲームルール(所持数・残量計算・時限効果)は変更しない。
import { Sheet } from "../ui/Sheet.jsx";
import { BrothVessel } from "../components/BrothVessel.jsx";
import { ItemImage } from "../components/ItemImage.jsx";
import { LadleIcon, ClockIcon } from "../icons/Icons.jsx";
import { getBroth } from "../data/broths.js";
import { ASSIST_ORDER, getAssist } from "../data/assists.js";
import { getAssistImageUrl } from "../data/itemImages.js";
import { getRemainingStatusLabel, getEffectRemainingMs, formatDurationShort } from "../game/selectors.js";
import "../ui/primitives.css";
import "./CareSheet.css";

// drop系(小瓶)とcare系(壺)で見かけの大きさを揃えるためのサイズクラス。
const ASSIST_IMAGE_SIZE_CLASS = {
  drop: "care-sheet__assist-image--bottle",
  "rich-drop": "care-sheet__assist-image--bottle",
  care: "care-sheet__assist-image--jar",
  "long-care": "care-sheet__assist-image--jar",
};

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
    <Sheet open={open} onClose={onClose} title="お世話" icon={<LadleIcon aria-hidden="true" />}>
      <div className="care-sheet__broth card">
        <div className="care-sheet__vessel-slot">
          <BrothVessel brothId={state.tank.brothId} />
        </div>
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
          <LadleIcon aria-hidden="true" size={16} />
          <span>
            {isFull ? "たっぷり" : "出汁を足す"}
            <span className="care-sheet__refill-note">{isFull ? "" : "補充は無料"}</span>
          </span>
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
          const disabled = owned <= 0 || categoryBusy || careBlocked;

          let disabledReason = null;
          if (!isThisActive) {
            if (owned <= 0) disabledReason = "未所持";
            else if (categoryBusy) disabledReason = "同系統を使用中";
            else if (careBlocked) disabledReason = "出汁を足してから使えます";
          }

          return (
            <li key={id} className="care-sheet__assist-item card">
              <div className={`care-sheet__assist-image-slot ${ASSIST_IMAGE_SIZE_CLASS[id]}`}>
                <ItemImage src={getAssistImageUrl(id)} />
              </div>
              <div className="care-sheet__assist-info">
                <p className="care-sheet__assist-name">
                  {assist.name} <span className="care-sheet__assist-count">×{owned}</span>
                </p>
                <p className="care-sheet__assist-tagline">{assist.tagline}</p>
                {disabledReason && <p className="care-sheet__assist-reason">{disabledReason}</p>}
              </div>
              {isThisActive ? (
                <span className="care-sheet__assist-active">使用中</span>
              ) : (
                <button
                  type="button"
                  className="btn care-sheet__assist-btn"
                  disabled={disabled}
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
              <ClockIcon aria-hidden="true" size={16} />
              {getAssist(state.effects.growth.itemId).name}{" "}
              {formatDurationShort(getEffectRemainingMs(state.effects.growth, state.lastSimulatedAt))}
            </p>
          )}
          {state.effects.care && (
            <p className="care-sheet__timer">
              <ClockIcon aria-hidden="true" size={16} />
              {getAssist(state.effects.care.itemId).name}{" "}
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
