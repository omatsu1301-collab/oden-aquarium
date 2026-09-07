// 図鑑/商店/具材詳細で共通の「夜の屋台」背景(仕様6.3/6.4)。提灯・暖簾・木棚・遠景の窓をSVG/CSSで構成する。
import "./NightBackdrop.css";

export function NightBackdrop() {
  return (
    <div className="night-backdrop" aria-hidden="true">
      <div className="night-backdrop__window">
        <div className="night-backdrop__window-buildings" />
      </div>
      <div className="night-backdrop__noren">
        <span className="night-backdrop__noren-panel" />
        <span className="night-backdrop__noren-panel" />
        <span className="night-backdrop__noren-panel" />
      </div>
      <div className="night-backdrop__lantern">
        <span className="night-backdrop__lantern-glow" />
        <span className="night-backdrop__lantern-text">おでん</span>
      </div>
      <div className="night-backdrop__shelf-texture" />
    </div>
  );
}
