import "./primitives.css";

export function Slider({ label, value, onChange, min = 0, max = 100 }) {
  return (
    <label className="slider-row">
      <span className="slider-row__label">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="slider-row__input"
      />
      <span className="slider-row__value">{value}%</span>
    </label>
  );
}
