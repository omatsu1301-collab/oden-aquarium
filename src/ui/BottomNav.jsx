// 最下部の主画面切替(図鑑｜水槽｜商店)。仕様6.1: 選択状態を示す。
import "./BottomNav.css";

const TABS = [
  { id: "catalog", label: "図鑑", icon: "📖" },
  { id: "tank", label: "水槽", icon: "🍶" },
  { id: "shop", label: "商店", icon: "🏮" },
];

export function BottomNav({ current, onChange }) {
  return (
    <nav className="bottom-nav" aria-label="主画面">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`bottom-nav__item${current === tab.id ? " is-active" : ""}`}
          onClick={() => onChange(tab.id)}
          aria-current={current === tab.id ? "page" : undefined}
        >
          <span className="bottom-nav__icon" aria-hidden="true">{tab.icon}</span>
          <span className="bottom-nav__label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
