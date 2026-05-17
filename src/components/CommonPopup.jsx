import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaInfoCircle
} from "react-icons/fa";

export default function CommonPopup({
  open,
  type = "info",
  message,
  onClose,
  onConfirm,
  showCancel = false
}) {

  if (!open) return null;

  const popupData = {
    success: {
      icon: <FaCheckCircle />,
      title: "Success",
      color: "#22c55e"
    },

    error: {
      icon: <FaTimesCircle />,
      title: "Error",
      color: "#ef4444"
    },

    warning: {
      icon: <FaExclamationTriangle />,
      title: "Warning",
      color: "#f59e0b"
    },

    info: {
      icon: <FaInfoCircle />,
      title: "Information",
      color: "#3b82f6"
    }
  };

  const current = popupData[type];

  return (
    <div className="common-popup-overlay">

      <div className="common-popup-box">

        {/* ICON */}
        <div
          className="common-popup-icon"
          style={{ background: current.color }}
        >
          {current.icon}
        </div>

        {/* TITLE */}
        <h2
          className="common-popup-title"
          style={{ color: current.color }}
        >
          {current.title}
        </h2>

        {/* MESSAGE */}
        <b className="common-popup-message">
          {message}
        </b>

        {/* BUTTONS */}
        <div className="common-popup-actions">

            {showCancel && (
                <button
                className="popup-btn close-btn"
                onClick={onClose}
                >
                Cancel
                </button>
            )}

            <button
                className="popup-btn ok-btn"
                onClick={async () => {

                if (onConfirm) {
                    await onConfirm();
                }

                onClose();
                }}
            >
                OK
            </button>

        </div>
      </div>

    </div>
  );
}