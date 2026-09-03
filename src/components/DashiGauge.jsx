// UIコンポーネント: dashiLevelの数値とゲージ表示のみを担当する。
import "./DashiGauge.css";

export function DashiGauge({ dashiLevel }) {
  const displayValue = Math.round(dashiLevel);

  return (
    <div className="dashi-gauge">
      <div className="dashi-gauge__label">出汁の染み込み具合</div>
      <div className="dashi-gauge__bar">
        <div className="dashi-gauge__bar-fill" style={{ width: `${displayValue}%` }} />
      </div>
      <div className="dashi-gauge__value">{displayValue}%</div>
    </div>
  );
}
