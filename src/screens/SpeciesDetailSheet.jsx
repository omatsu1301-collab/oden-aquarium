// 具材詳細(仕様6.6)。03-character-detail.png内部+背後は06(夜)。
import { useState } from "react";
import { Sheet } from "../ui/Sheet.jsx";
import { Bowl } from "../components/Bowl.jsx";
import { getSpecies } from "../data/species.js";
import { BROTH_ORDER, getBroth } from "../data/broths.js";
import { BOWL_DECORATION_ORDER, getDecoration } from "../data/decorations.js";
import "./SpeciesDetailSheet.css";

function formatLocalDate(epochMs) {
  const d = new Date(epochMs);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export function SpeciesDetailSheet({ open, onClose, speciesId, state, dispatch, onGoToShop }) {
  const [pickingBowl, setPickingBowl] = useState(false);

  if (!open || !speciesId) return null;
  const species = getSpecies(speciesId);
  const entry = state.catalog[speciesId];
  if (!entry) return null;

  function toggleFavorite() {
    dispatch({ type: "SET_FAVORITE", speciesId, favorite: !entry.favorite });
  }

  function chooseBowl(bowlId) {
    dispatch({ type: "APPLY_BOWL", speciesId, bowlId });
    setPickingBowl(false);
  }

  return (
    <Sheet open={open} onClose={() => { setPickingBowl(false); onClose(); }} title={`No.${String(species.no).padStart(3, "0")}`}>
      <h2 className="species-detail__name">{species.name}</h2>
      <div className="species-detail__bowl">
        <Bowl speciesId={speciesId} speciesName={species.name} bowlId={entry.bowlId} size="large" />
      </div>
      <p className="species-detail__description">{species.description}</p>

      <hr className="section-divider" />
      <dl className="species-detail__stats">
        <div>
          <dt>はじめての出会い</dt>
          <dd>{formatLocalDate(entry.firstSeenAt)}</dd>
        </div>
        <div>
          <dt>すくった数</dt>
          <dd>{entry.harvestCount}</dd>
        </div>
        <div>
          <dt>出会える出汁</dt>
          <dd>すべての出汁</dd>
        </div>
      </dl>

      <hr className="section-divider" />
      <h3 className="species-detail__section-title">染め記録</h3>
      <div className="species-detail__dye-grid">
        {BROTH_ORDER.map((brothId) => {
          const count = entry.brothCounts[brothId] ?? 0;
          const broth = getBroth(brothId);
          return (
            <div key={brothId} className={`species-detail__dye${count > 0 ? " is-recorded" : ""}`}>
              <span className="species-detail__dye-swatch" style={{ background: broth.glow }} aria-hidden="true">
                {count === 0 && "?"}
              </span>
              <span className="species-detail__dye-name">{count > 0 ? broth.name : "???"}</span>
              {count > 0 && <span className="species-detail__dye-count">×{count}</span>}
            </div>
          );
        })}
      </div>

      <hr className="section-divider" />
      {!pickingBowl ? (
        <button type="button" className="btn btn--outline btn--block" onClick={() => setPickingBowl(true)}>
          器を変える
        </button>
      ) : (
        <div className="species-detail__bowl-picker">
          {BOWL_DECORATION_ORDER.map((bowlId) => {
            const owned = state.inventory.ownedIds.includes(bowlId);
            const selected = bowlId === entry.bowlId;
            const decoration = getDecoration(bowlId);
            return (
              <button
                key={bowlId}
                type="button"
                className={`species-detail__bowl-option${selected ? " is-selected" : ""}`}
                disabled={!owned}
                aria-pressed={selected}
                onClick={() => (owned ? chooseBowl(bowlId) : onGoToShop?.())}
              >
                <Bowl speciesId={speciesId} speciesName={species.name} bowlId={bowlId} discovered />
                <span>{selected ? `${decoration.name} ✓` : owned ? decoration.name : "商店へ"}</span>
              </button>
            );
          })}
        </div>
      )}

      <button
        type="button"
        className={`btn btn--block species-detail__favorite-btn${entry.favorite ? " is-active" : ""}`}
        onClick={toggleFavorite}
      >
        {entry.favorite ? "♥ お気に入り中" : "♡ お気に入りにする"}
      </button>
    </Sheet>
  );
}
