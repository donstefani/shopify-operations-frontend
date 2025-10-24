import { useState, useEffect, useCallback } from 'react';
import { useWebhookEvents } from './useWebhookEvents';
import { WebhookEvent } from '@/lib/event-client';

/**
 * Hook for managing webhook event notifications
 * 
 * This hook monitors webhook events and shows notifications for important events
 * like new orders, product updates, etc. It tracks which events have been shown
 * to avoid duplicate notifications.
 */

export interface WebhookNotification {
  id: string;
  event: WebhookEvent;
  timestamp: Date;
}

export interface UseWebhookNotificationsOptions {
  /** Shop domain to monitor */
  shopDomain?: string;
  /** Polling interval in milliseconds */
  pollInterval?: number;
  /** Whether to show notifications for new orders */
  showOrderNotifications?: boolean;
  /** Whether to show notifications for product events */
  showProductNotifications?: boolean;
  /** Whether to show notifications for customer events */
  showCustomerNotifications?: boolean;
  /** Maximum number of notifications to keep in history */
  maxHistory?: number;
}

export interface UseWebhookNotificationsReturn {
  /** Array of active notifications */
  notifications: WebhookNotification[];
  /** Dismiss a notification */
  dismissNotification: (notificationId: string) => void;
  /** Clear all notifications */
  clearAllNotifications: () => void;
  /** Whether notifications are enabled */
  notificationsEnabled: boolean;
  /** Toggle notifications on/off */
  toggleNotifications: () => void;
}

export function useWebhookNotifications(
  options: UseWebhookNotificationsOptions = {}
): UseWebhookNotificationsReturn {
  const {
    shopDomain,
    pollInterval = 5000,
    showOrderNotifications = true,
    showProductNotifications = false,
    showCustomerNotifications = false,
    maxHistory = 10
  } = options;

  const [notifications, setNotifications] = useState<WebhookNotification[]>([]);
  const [seenEventIds, setSeenEventIds] = useState<Set<string>>(new Set());
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Monitor webhook events
  const { events } = useWebhookEvents({
    shopDomain,
    pollInterval,
    autoStart: notificationsEnabled,
    limit: 20 // Get more events to catch any we might have missed
  });

  /**
   * Check if an event should trigger a notification
   */
  const shouldNotify = useCallback((event: WebhookEvent): boolean => {
    if (!notificationsEnabled) return false;
    if (seenEventIds.has(event.event_id)) return false;

    // Check if event type should trigger notifications
    if (showOrderNotifications && event.topic.startsWith('orders/')) {
      return true;
    }
    if (showProductNotifications && event.topic.startsWith('products/')) {
      return true;
    }
    if (showCustomerNotifications && event.topic.startsWith('customers/')) {
      return true;
    }

    return false;
  }, [notificationsEnabled, seenEventIds, showOrderNotifications, showProductNotifications, showCustomerNotifications]);

  /**
   * Add a new notification
   */
  const addNotification = useCallback((event: WebhookEvent) => {
    // Generate a unique notification ID using event_id + timestamp + random suffix
    const uniqueId = `notification-${event.event_id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const notification: WebhookNotification = {
      id: uniqueId,
      event,
      timestamp: new Date()
    };

    setNotifications(prev => {
      const newNotifications = [notification, ...prev];
      // Keep only the most recent notifications
      return newNotifications.slice(0, maxHistory);
    });

    // Mark event as seen
    setSeenEventIds(prev => new Set([...prev, event.event_id]));
  }, [maxHistory]);

  /**
   * Dismiss a notification
   */
  const dismissNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  /**
   * Clear all notifications
   */
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  /**
   * Toggle notifications on/off
   */
  const toggleNotifications = useCallback(() => {
    setNotificationsEnabled(prev => !prev);
  }, []);

  // Monitor events for new notifications
  useEffect(() => {
    if (!events || !notificationsEnabled) return;

    // Check for new events that should trigger notifications
    events.forEach(event => {
      if (shouldNotify(event)) {
        addNotification(event);
      }
    });
  }, [events, notificationsEnabled]); // Removed shouldNotify and addNotification from dependencies to prevent infinite loop

  // Clean up old notifications periodically
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      setNotifications(prev => 
        prev.filter(notification => notification.timestamp > fiveMinutesAgo)
      );
    }, 60000); // Clean up every minute

    return () => clearInterval(cleanupInterval);
  }, []);

  return {
    notifications,
    dismissNotification,
    clearAllNotifications,
    notificationsEnabled,
    toggleNotifications
  };
}
