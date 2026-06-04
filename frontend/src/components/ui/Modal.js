import React from "react";
export default function Modal({
  title,
  onClose,
  children,
  footer,
  wide = false,
}) {
  return (
    <div
      className="overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" style={{ maxWidth: wide ? 760 : 560 }}>
        <div className="modal-hd">
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-bd">{children}</div>
        {footer && <div className="modal-ft">{footer}</div>}
      </div>
    </div>
  );
}
