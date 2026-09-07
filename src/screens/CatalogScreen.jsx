// 図鑑画面(仕様6.3)。06-catalog-night.pngの夜の屋台・木棚を再現する。
// 具材詳細はAppShellのpanel(history連携)経由で開く。未発見のヒントだけこの画面のローカルSheet。
import { useState } from "react";
import { CatalogNightBackdrop } from "../components/CatalogNightBackdrop.jsx";
import { Bowl } from "../components/Bowl.jsx";
import { Sheet } from "../ui/Sheet.jsx";
import { SPECIES_ORDER, getSpecies } from "../data/species.js";
import { getDiscoveredSpeciesCount } from "../game/selectors.js";
import "./CatalogScreen.css";

export function CatalogScreen({ state, onOpenSpeciesDetail }) {
  const [showUnknownHint, setShowUnknownHint] = useState(false);

  const discoveredCount = getDiscoveredSpeciesCount(state.catalog);

  function handleCardClick(speciesId) {
    const entry = state.catalog[speciesId];
    if (entry?.firstSeenAt != null) {
      onOpenSpeciesDetail(speciesId);
    } else {
      setShowUnknownHint(true);
    }
  }

  return (
    <div className="catalog-screen">
      <div className="catalog-screen__content">
        <CatalogNightBackdrop />
        <div className="catalog-screen__header">
          <div className="catalog-screen__title-card">
            <h1 className="catalog-screen__title">図鑑</h1>
            <p className="catalog-screen__subtitle">出会った具材たち</p>
          </div>
          <div className="catalog-screen__count">
            <span className="catalog-screen__count-value">{discoveredCount}/5</span>
            <span className="catalog-screen__count-label">発見</span>
          </div>
        </div>

        <div className="catalog-screen__grid">
          {SPECIES_ORDER.map((speciesId) => {
            const species = getSpecies(speciesId);
            const entry = state.catalog[speciesId];
            const discovered = entry?.firstSeenAt != null;
            return (
              <button
                key={speciesId}
                type="button"
                className="catalog-screen__card"
                onClick={() => handleCardClick(speciesId)}
              >
                <Bowl
                  speciesId={speciesId}
                  speciesName={species.name}
                  bowlId={entry?.bowlId ?? "bowl-white"}
                  discovered={discovered}
                />
                <span className="catalog-screen__card-label">
                  {String(species.no).padStart(3, "0")} {discovered ? species.name : "???"}
                </span>
                {discovered && entry.favorite && (
                  <span className="catalog-screen__favorite" aria-hidden="true">♥</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <Sheet open={showUnknownHint} onClose={() => setShowUnknownHint(false)} title="???">
        <p>まだ出会っていません。水槽で具材をすくうと記録されます。</p>
      </Sheet>
    </div>
  );
}
