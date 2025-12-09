import React from "react";
import CheckmarkIcon from "../../icon/Checkmark.svg";
import "./popup.css";

export default function Popup({
  isOpen,
  onClose,
  title,
  message,
  type = "info",
  onConfirm,
  confirmText = "Yes",
  cancelText = "No",
  showCloseButton = true,
  children,
}) {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <div className="popup-overlay" onClick={handleOverlayClick}>
      <div className="popup-content">
        {showCloseButton && (
          <button className="popup-close" onClick={onClose}>
            ✕
          </button>
        )}

        {title && <h3 className="popup-title">{title}</h3>}

        {message && <p className="popup-message">{message}</p>}

        {children && <div className="popup-body">{children}</div>}

        {type === "confirm" && (
          <div className="popup-buttons">
            <button className="popup-btn confirm-btn" onClick={handleConfirm}>
              {confirmText}
            </button>
            <button className="popup-btn cancel-btn" onClick={onClose}>
              {cancelText}
            </button>
          </div>
        )}

        {type === "success" && (
          <div className="popup-icon-wrapper">
            <div className="popup-icon success-icon">
              <img src={CheckmarkIcon} alt="Success" style={{ width: "32px", height: "32px" }} />
            </div>
          </div>
        )}

        {type === "error" && (
          <div className="popup-icon-wrapper">
            <div className="popup-icon error-icon">✕</div>
          </div>
        )}

        {type === "info" && !children && (
          <div className="popup-buttons center">
            <button className="popup-btn confirm-btn" onClick={onClose}>
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
}