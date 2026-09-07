// 商店画面(仕様6.4)。07-shop-night.pngの夜の道具屋・5売り場を再現する。
import { useState } from "react";
import { NightBackdrop } from "../components/NightBackdrop.jsx";
import { ShopItemDetailSheet } from "./ShopItemDetailSheet.jsx";
import { SHOP_TABS, getShopTabItems } from "../data/shopCatalog.js";
import "./ShopScreen.css";

function ShopItemIcon({ item }) {
  const icons = {
    broth: "🍶",
    pot: "🍲",
    tool: "🧰",
    assist: item.category === "growth" ? "💧" : "🫙",
    decoration: item.slotType === "bowl" ? "🥣" : "🪴",
  };
  return <span className="shop-item-card__icon" aria-hidden="true">{icons[item.category]}</span>;
}

function itemStatusLabel(item, state) {
  const owned = state.inventory.ownedIds.includes(item.id);
  if (item.category === "broth" && state.tank.brothId === item.id) return "使用中";
  if (item.category === "pot" && state.tank.potId === item.id) return "使用中";
  if (item.category === "tool") {
    const equipped =
      (item.slotType === "lid" && state.tank.tools.lid === item.id) ||
      (item.slotType === "paddle" && state.tank.tools.paddle) ||
      (item.slotType === "lamp" && state.tank.tools.lamp);
    if (equipped) return "使用中";
  }
  if (item.category === "decoration" && item.slotType === "tank" && state.tank.decorationId === item.id) {
    return "使用中";
  }
  if (item.kind === "permanent" && owned) return "所持";
  if (item.kind === "consumable") {
    const count = state.inventory.consumables[item.id] ?? 0;
    return count > 0 ? `所持×${count}` : null;
  }
  return null;
}

export function ShopScreen({ state, dispatch }) {
  const [activeTab, setActiveTab] = useState("broth");
  const [openItemId, setOpenItemId] = useState(null);

  return (
    <div className="shop-screen">
      <NightBackdrop />
      <div className="shop-screen__content">
        <div className="shop-screen__header">
          <div>
            <h1 className="shop-screen__title">商店</h1>
            <p className="shop-screen__subtitle">だしのある暮らしに。</p>
          </div>
          <div className="shop-screen__wallet">
            <span aria-hidden="true">●</span> {state.wallet} pt
          </div>
        </div>

        <div className="shop-screen__tabs">
          {SHOP_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`shop-screen__tab${activeTab === tab.id ? " is-active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {SHOP_TABS.map((tab) => (
          <div key={tab.id} className="shop-screen__panel" hidden={activeTab !== tab.id}>
            <p className="shop-screen__lead">{tab.lead}</p>
            <div className="shop-screen__grid">
              {getShopTabItems(tab.id).map((item) => {
                const status = itemStatusLabel(item, state);
                return (
                  <button
                    key={item.id}
                    type="button"
                    className="shop-item-card"
                    onClick={() => setOpenItemId(item.id)}
                  >
                    <ShopItemIcon item={item} />
                    <span className="shop-item-card__name">{item.name}</span>
                    <span className="shop-item-card__tagline">{item.tagline}</span>
                    {status ? (
                      <span className={`shop-item-card__status${status === "使用中" ? " is-active" : ""}`}>
                        {status}
                      </span>
                    ) : (
                      <span className="shop-item-card__price">{item.price} pt</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <ShopItemDetailSheet
        open={openItemId !== null}
        onClose={() => setOpenItemId(null)}
        itemId={openItemId}
        state={state}
        dispatch={dispatch}
      />
    </div>
  );
}
