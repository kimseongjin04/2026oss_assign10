import React from "react";

export default function Modal({ show, onClose, children }) {
  if (!show) return null;
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        {children}
        <div className="actions">
          <button className="btn" onClick={onClose}>
            이어하기
          </button>
        </div>
      </div>
    </div>
  );
}
