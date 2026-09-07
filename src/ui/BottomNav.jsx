// 最下部の主画面切替(図鑑｜水槽｜商店)。仕様6.1: 選択状態を示す。
// 美術改善パス1: 絵文字を共通線画SVGへ置換。
import { BookIcon, TankJarIcon, ShopIcon } from "../icons/Icons.jsx";
import "./BottomNav.css";

const TABS = [
  { id: "catalog", label: "図鑑", Icon: BookIcon },
  { id: "tank", label: "水槽", Icon: TankJarIcon },
  { id: "shop", label: "商店", Icon: ShopIcon },
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
          <tab.Icon aria-hidden="true" className="bottom-nav__icon" size={22} />
          <span className="bottom-nav__label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
