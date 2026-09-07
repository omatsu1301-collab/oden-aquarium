// 共通Sheet(下からせり上がるパネル)。仕様6.1:
// role=dialog/aria-modal、フォーカス移動と復帰、見出し/閉じるを固定し内容のみスクロール。
import { useEffect, useRef } from "react";
import { CloseIcon } from "../icons/Icons.jsx";
import "./Sheet.css";

export function Sheet({ open, onClose, title, icon, headerExtra, children, labelledBy }) {
  const closeButtonRef = useRef(null);
  const previouslyFocusedRef = useRef(null);
  const titleId = labelledBy ?? "sheet-title";

  useEffect(() => {
    if (!open) return;
    previouslyFocusedRef.current = document.activeElement;
    closeButtonRef.current?.focus();
    function onKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (previouslyFocusedRef.current instanceof HTMLElement) {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet__handle" aria-hidden="true" />
        <div className="sheet__header">
          <h2 className="sheet__title" id={titleId}>
            {icon && <span className="sheet__title-icon" aria-hidden="true">{icon}</span>}
            {title}
          </h2>
          <div className="sheet__header-extra">{headerExtra}</div>
          <button
            type="button"
            ref={closeButtonRef}
            className="sheet__close"
            onClick={onClose}
            aria-label="閉じる"
          >
            <CloseIcon aria-hidden="true" />
          </button>
        </div>
        <div className="sheet__content">{children}</div>
      </div>
    </div>
  );
}
