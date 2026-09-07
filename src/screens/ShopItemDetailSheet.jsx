// 商品詳細シート(仕様5)。画像・説明・効果・価格・所持・適用先プレビュー→購入する→使う/装備する/飾る。
import { Sheet } from "../ui/Sheet.jsx";
import { getShopItem } from "../data/shopCatalog.js";
import { SPECIES_ORDER, getSpecies } from "../data/species.js";
import { playSe } from "../audio/audioEngine.js";
import "../ui/primitives.css";
import "./ShopItemDetailSheet.css";

function effectDescription(item) {
  switch (item.category) {
    case "broth":
      return `水槽の色: ${item.colorLabel}`;
    case "pot":
      return `${item.slots}枠・出汁${item.fullHours}時間・成長速度×${item.speedMultiplier}`;
    case "tool":
      return item.effectLabel;
    case "assist":
      return item.effectLabel;
    case "decoration":
      return item.slotType === "bowl" ? "図鑑の器(能力なし)" : "水槽の景観(能力なし)";
    default:
      return null;
  }
}

export function ShopItemDetailSheet({ open, onClose, itemId, state, dispatch }) {
  if (!open || !itemId) return null;
  const item = getShopItem(itemId);
  const owned = state.inventory.ownedIds.includes(itemId);
  const consumableCount = state.inventory.consumables[itemId] ?? 0;
  const canAfford = state.wallet >= item.price;
  const shortfall = item.price - state.wallet;

  function buy() {
    dispatch({ type: "BUY_ITEM", itemId });
    playSe("purchase");
  }

  return (
    <Sheet open={open} onClose={onClose} title={item.name}>
      <p className="shop-detail__tagline">{item.tagline}</p>
      <div className="card shop-detail__effect">{effectDescription(item)}</div>

      {item.kind === "permanent" && !owned && (
        <div className="shop-detail__purchase">
          <button type="button" className="btn btn--primary btn--block" disabled={!canAfford} onClick={buy}>
            購入する({item.price}pt)
          </button>
          {!canAfford && (
            <p className="shop-detail__shortfall">あと{shortfall}pt足りません(所持{state.wallet}pt)</p>
          )}
        </div>
      )}

      {item.kind === "consumable" && (
        <div className="shop-detail__purchase">
          <p className="shop-detail__owned-count">所持: {consumableCount}個</p>
          <button type="button" className="btn btn--primary btn--block" disabled={!canAfford} onClick={buy}>
            購入する({item.price}pt)
          </button>
          {!canAfford && (
            <p className="shop-detail__shortfall">あと{shortfall}pt足りません(所持{state.wallet}pt)</p>
          )}
        </div>
      )}

      <hr className="section-divider" />

      {item.category === "broth" && (owned || item.price === 0) && (
        state.tank.brothId === itemId ? (
          <p className="shop-detail__active-note">使用中</p>
        ) : (
          <button type="button" className="btn btn--outline btn--block" onClick={() => dispatch({ type: "EQUIP_BROTH", brothId: itemId })}>
            使う
          </button>
        )
      )}

      {item.category === "pot" && (owned || item.price === 0) && (
        state.tank.potId === itemId ? (
          <p className="shop-detail__active-note">使用中</p>
        ) : (
          <button type="button" className="btn btn--outline btn--block" onClick={() => dispatch({ type: "EQUIP_POT", potId: itemId })}>
            使う
          </button>
        )
      )}

      {item.category === "tool" && owned && (
        <ToolEquipRow item={item} state={state} dispatch={dispatch} />
      )}

      {item.category === "assist" && (
        <AssistUseRow item={item} state={state} dispatch={dispatch} owned={consumableCount} />
      )}

      {item.category === "decoration" && item.slotType === "tank" && (owned || item.price === 0) && (
        state.tank.decorationId === itemId ? (
          <button type="button" className="btn btn--outline btn--block" onClick={() => dispatch({ type: "APPLY_DECORATION", decorationId: null })}>
            外す
          </button>
        ) : (
          <button type="button" className="btn btn--outline btn--block" onClick={() => dispatch({ type: "APPLY_DECORATION", decorationId: itemId })}>
            飾る
          </button>
        )
      )}

      {item.category === "decoration" && item.slotType === "bowl" && (owned || item.price === 0) && (
        <BowlApplyRow item={item} state={state} dispatch={dispatch} />
      )}
    </Sheet>
  );
}

function ToolEquipRow({ item, state, dispatch }) {
  const equipped =
    (item.slotType === "lid" && state.tank.tools.lid === item.id) ||
    (item.slotType === "paddle" && state.tank.tools.paddle) ||
    (item.slotType === "lamp" && state.tank.tools.lamp);
  return (
    <button
      type="button"
      className="btn btn--outline btn--block"
      onClick={() =>
        dispatch({ type: "SET_TOOL", toolId: equipped ? null : item.id, slotType: item.slotType })
      }
    >
      {equipped ? "外す" : "装備する"}
    </button>
  );
}

function AssistUseRow({ item, state, dispatch, owned }) {
  const activeEffect = item.category === "growth" ? state.effects.growth : state.effects.care;
  const isThisActive = activeEffect?.itemId === item.id;
  const categoryBusy = Boolean(activeEffect) && !isThisActive;
  const careBlocked = item.category === "care" && state.tank.remainingRatio <= 0;
  if (isThisActive) return <p className="shop-detail__active-note">使用中</p>;
  return (
    <button
      type="button"
      className="btn btn--outline btn--block"
      disabled={owned <= 0 || categoryBusy || careBlocked}
      onClick={() => dispatch({ type: "USE_ASSIST", assistId: item.id })}
    >
      使う
    </button>
  );
}

function BowlApplyRow({ item, state, dispatch }) {
  const discovered = SPECIES_ORDER.filter((id) => state.catalog[id]?.firstSeenAt != null);
  if (discovered.length === 0) {
    return <p className="shop-detail__active-note">まだ図鑑に具材がいません。水槽ですくってから飾れます。</p>;
  }
  return (
    <div className="shop-detail__bowl-targets">
      <p className="shop-detail__bowl-targets-lead">どの具材の器にする?</p>
      <div className="shop-detail__bowl-targets-grid">
        {discovered.map((speciesId) => {
          const species = getSpecies(speciesId);
          const applied = state.catalog[speciesId].bowlId === item.id;
          return (
            <button
              key={speciesId}
              type="button"
              className={`btn${applied ? " btn--primary" : " btn--outline"}`}
              onClick={() => dispatch({ type: "APPLY_BOWL", speciesId, bowlId: item.id })}
            >
              {species.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
