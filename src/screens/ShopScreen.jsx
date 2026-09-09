// 商店画面(仕様6.4)。Instruction 15: 商店shellの代表実装。
// 商品詳細はAppShellのpanel(history連携)経由で開く。商品データとgame actionは変えない。
import { useState } from "react";
import { ShopBackdrop } from "../components/ShopBackdrop.jsx";
import { SHOP_TABS, getShopTabItems } from "../data/shopCatalog.js";
import {
  ShopAssistIcon,
  ShopBrothIcon,
  ShopCoinIcon,
  ShopDecorationIcon,
  ShopNorenCrestIcon,
  ShopPotIcon,
  ShopToolIcon,
} from "../icons/Icons.jsx";
import { getShopCardDisplayStatus } from "../presentation/shopCardStatus.js";
import "./ShopScreen.css";

const CATEGORY_ICONS = {
  broth: ShopBrothIcon,
  pot: ShopPotIcon,
  tool: ShopToolIcon,
  assist: ShopAssistIcon,
  decoration: ShopDecorationIcon,
};

function ShopCategoryIcon({ category, size, className }) {
  const Icon = CATEGORY_ICONS[category] ?? ShopDecorationIcon;
  return <Icon className={className} size={size} aria-hidden="true" />;
}

function ShopItemCard({ item, state, onOpen }) {
  const status = getShopCardDisplayStatus(item, state);
  const showPrice = status.kind === "purchasable" || status.kind === "shortfall";
  return (
    <button
      type="button"
      className={`shop-item-card is-${status.kind}`}
      onClick={() => onOpen(item.id)}
    >
      <ShopCategoryIcon category={item.category} size={24} className="shop-item-card__icon" />
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
      <ShopBackdrop />
      <div className="shop-screen__content">
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

        <div className="shop-screen__tabs">
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
