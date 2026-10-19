import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { playNotificationChime } from '../utils/soundNotification';
import { storage } from '../utils/storage';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Check if current user is Master Admin or Admin with add/edit access
  const hasAlertPermission = useCallback(() => {
    if (storage.isAdmin()) return true;
    const permissions = storage.getPermissions() || [];
    // If user has write/add/edit permission in any core module
    return permissions.some(p => p?.add === true || p?.edit === true || p?.view === true || p?.insertUpdate === true);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addNotification = useCallback(({ title, message, type = 'activity', duration = 5000, sender = null }) => {
    // Only notify if user has access or it's a message
    if (!hasAlertPermission() && type !== 'message') return;

    const id = Date.now() + Math.random().toString(36).substring(2, 7);
    const newNotif = {
      id,
      title: title || (type === 'message' ? `New Message from ${sender || 'Chat'}` : 'System Activity'),
      message: message || '',
      type, // 'activity' | 'message' | 'success' | 'warning' | 'error'
      sender,
      timestamp: new Date(),
    };

    // Play chime sound
    playNotificationChime(type === 'message' ? 'message' : type === 'error' ? 'error' : 'success');

    setNotifications((prev) => [newNotif, ...prev.slice(0, 4)]); // Keep at most 5 toasts

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }, [hasAlertPermission, removeNotification]);

  // Global window event listener so any page/component can trigger toasts via window.dispatchEvent
  useEffect(() => {
    const handleCustomNotify = (e) => {
      if (e.detail) {
        addNotification(e.detail);
      }
    };

    window.addEventListener('naari-notification', handleCustomNotify);
    return () => {
      window.removeEventListener('naari-notification', handleCustomNotify);
    };
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification, notifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      addNotification: ({ title, message, type }) => {
        window.dispatchEvent(new CustomEvent('naari-notification', { detail: { title, message, type } }));
      },
      removeNotification: () => {},
      notifications: [],
    };
  }
  return context;
};

// Global helper function for external or non-hook code
export const triggerInAppNotification = (title, message, type = 'activity') => {
  window.dispatchEvent(
    new CustomEvent('naari-notification', {
      detail: { title, message, type },
    })
  );
};
