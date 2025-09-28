import { useState, useCallback } from 'react';
import { NotificationType } from '../components/Notification';

/**
 * 🎯 Notification state interface
 */
interface NotificationState {
  type: NotificationType;
  message: string;
  isVisible: boolean;
  duration?: number;
}

/**
 * 🚀 Custom hook for managing notifications
 * Features:
 * - Type-safe notifications
 * - Auto-dismiss functionality
 * - Queue management
 * - Success/Error helpers
 */
export const useNotifications = () => {
  const [notification, setNotification] = useState<NotificationState>({
    type: 'info',
    message: '',
    isVisible: false,
    duration: 5000,
  });

  /**
   * Show notification with custom settings
   */
  const showNotification = useCallback((
    type: NotificationType,
    message: string,
    duration: number = 5000
  ) => {
    setNotification({
      type,
      message,
      isVisible: true,
      duration,
    });
  }, []);

  /**
   * Hide current notification
   */
  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  }, []);

  /**
   * Show success notification
   */
  const showSuccess = useCallback((message: string, duration?: number) => {
    showNotification('success', message, duration);
  }, [showNotification]);

  /**
   * Show error notification
   */
  const showError = useCallback((message: string, duration?: number) => {
    showNotification('error', message, duration);
  }, [showNotification]);

  /**
   * Show info notification
   */
  const showInfo = useCallback((message: string, duration?: number) => {
    showNotification('info', message, duration);
  }, [showNotification]);

  /**
   * Show loading notification (auto-dismiss disabled)
   */
  const showLoading = useCallback((message: string) => {
    showNotification('info', message, 0); // 0 = no auto-dismiss
  }, [showNotification]);

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showInfo,
    showLoading,
  };
};
