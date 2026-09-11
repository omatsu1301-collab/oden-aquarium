// 商店画面(仕様6.4)。Instruction 16: 採用済み最終美術をPR #15 shellへ接続。
// 商品詳細はAppShellのpanel(history連携)経由で開く。商品データとgame actionは変えない。
import { useState } from "react";
import { ShopBackdrop } from "../components/ShopBackdrop.jsx";
import { SHOP_TABS, getShopTabItems } from "../data/shopCatalog.js";
import { ShopCoinIcon, ShopNorenCrestIcon } from "../icons/Icons.jsx";
import { SHOP_CATEGORY_ICONS } from "../presentation/shopCategoryIcons.js";
import { getShopCardDisplayStatus } from "../presentation/shopCardStatus.js";
import "./ShopScreen.css";

function ShopCategoryIcon({ category, size, className }) {
  const Icon = SHOP_CATEGORY_ICONS[category] ?? SHOP_CATEGORY_ICONS.decoration;
  return <Icon className={className} size={size} aria-hidden="true" />;
}

export function ShopItemCard({ item, state, onOpen }) {
  const status = getShopCardDisplayStatus(item, state);
  const showPrice = status.kind === "purchasable" || status.kind === "shortfall";
  return (
    <button
      type="button"
      className={`shop-item-card is-${status.kind}`}
      onClick={() => onOpen(item.id)}
    >
      <span className="shop-item-card__media" aria-hidden="true" />
      <span className="shop-item-card__name">{item.name}</span>
      <span className="shop-item-card__tagline">{item.tagline}</span>
      <span className={`shop-item-card__status is-${status.kind}`}>{status.label}</span>
      {showPrice ? (
        <span className="shop-item-card__price">
          <ShopCoinIcon size={12} aria-hidden="true" />
          {status.price} pt
        </span>
      ) : null}
    </button>
  );
}

export function ShopScreen({ state, onOpenItemDetail }) {
  const [activeTab, setActiveTab] = useState("broth");

  return (
    <div className="shop-screen">
      <div className="shop-screen__content">
        <ShopBackdrop />
        <div className="shop-screen__header">
          <div className="shop-screen__sign">
            <ShopNorenCrestIcon className="shop-screen__sign-crest" size={22} aria-hidden="true" />
            <div className="shop-screen__sign-text">
              <h1 className="shop-screen__title">商店</h1>
              <p className="shop-screen__subtitle">だしのある暮らしに。</p>
            </div>
          </div>
          <div className="shop-screen__wallet">
            <ShopCoinIcon className="shop-screen__wallet-coin" size={16} aria-hidden="true" />
            <span className="shop-screen__wallet-value">{state.wallet}</span>
            <span className="shop-screen__wallet-unit">pt</span>
          </div>
        </div>

        <div className="shop-screen__tabs" role="tablist" aria-label="商店カテゴリ">
          {SHOP_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`shop-screen__tab${activeTab === tab.id ? " is-active" : ""}`}
              aria-pressed={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              <ShopCategoryIcon category={tab.id} size={20} className="shop-screen__tab-icon" />
              <span className="shop-screen__tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        {SHOP_TABS.map((tab) => (
          <div key={tab.id} className="shop-screen__panel" hidden={activeTab !== tab.id}>
            <p className="shop-screen__lead">{tab.lead}</p>
            <div className="shop-screen__grid">
              {getShopTabItems(tab.id).map((item) => (
                <ShopItemCard key={item.id} item={item} state={state} onOpen={onOpenItemDetail} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
