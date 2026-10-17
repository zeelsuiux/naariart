import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { FiBell, FiMessageSquare, FiAlertTriangle, FiX } from 'react-icons/fi';

const GlobalNotificationToast = () => {
  const { notifications, removeNotification } = useNotification();

  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="naari-toast-container" aria-live="polite">
      {notifications.map((notif) => {
        const isMsg = notif.type === 'message';
        const isErr = notif.type === 'error';
        const isWarn = notif.type === 'warning';

        return (
          <div
            key={notif.id}
            className={`naari-toast-item ${notif.type}`}
            role="alert"
          >
            <div className="toast-icon-wrapper">
              {isMsg ? (
                <FiMessageSquare className="toast-icon msg" />
              ) : isErr || isWarn ? (
                <FiAlertTriangle className="toast-icon warn" />
              ) : (
                <FiBell className="toast-icon bell" />
              )}
            </div>

            <div className="toast-content">
              <div className="toast-header-row">
                <span className="toast-title">{notif.title}</span>
                <span className="toast-time">Just now</span>
              </div>
              <p className="toast-message">{notif.message}</p>
            </div>

            <button
              type="button"
              className="toast-close-btn"
              onClick={() => removeNotification(notif.id)}
              aria-label="Dismiss notification"
            >
              <FiX size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default GlobalNotificationToast;
