import "./primitives.css";

export function Toggle({ checked, onChange, label, disabled, disabledNote }) {
  return (
    <label className={`toggle-row${disabled ? " is-disabled" : ""}`}>
      <span className="toggle-row__label">
        {label}
        {disabledNote && <span className="toggle-row__note">{disabledNote}</span>}
      </span>
      <span className="toggle-row__control">
        {!disabled && (
          <span className="toggle-row__state" aria-hidden="true">
            {checked ? "オン" : "オフ"}
          </span>
        )}
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          className={`toggle-switch${checked ? " is-checked" : ""}`}
          onClick={() => !disabled && onChange(!checked)}
        >
          <span className="toggle-switch__thumb" />
        </button>
      </span>
    </label>
  );
}
