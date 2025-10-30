import { useState, useEffect } from 'react';
import { WebhookEvent } from '@/lib/event-client';

/**
 * Notification Toast Component
 * 
 * Displays toast notifications for important webhook events like new orders.
 * Auto-dismisses after a few seconds and can be manually dismissed.
 */

export interface NotificationToastProps {
  event: WebhookEvent;
  notificationId: string;
  onDismiss: (notificationId: string) => void;
  autoDismiss?: boolean;
  duration?: number;
}

export function NotificationToast({ 
  event, 
  notificationId,
  onDismiss, 
  autoDismiss = true, 
  duration = 5000 
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onDismiss(notificationId), 300); // Wait for animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoDismiss, duration, notificationId]); // Removed onDismiss from dependencies since it's memoized

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(notificationId), 300);
  };

  const getNotificationIcon = (topic: string) => {
    if (topic.startsWith('orders/')) return '🛒';
    if (topic.startsWith('products/')) return '📦';
    if (topic.startsWith('customers/')) return '👤';
    return '🔔';
  };

  const getNotificationColor = (topic: string) => {
    if (topic.startsWith('orders/')) return 'bg-green-500';
    if (topic.startsWith('products/')) return 'bg-blue-500';
    if (topic.startsWith('customers/')) return 'bg-purple-500';
    return 'bg-gray-500';
  };

  const getNotificationTitle = (topic: string) => {
    switch (topic) {
      case 'orders/create': return 'New Order!';
      case 'orders/paid': return 'Order Paid!';
      case 'orders/fulfilled': return 'Order Fulfilled!';
      case 'products/create': return 'New Product!';
      case 'products/update': return 'Product Updated!';
      case 'customers/create': return 'New Customer!';
      default: return 'New Event!';
    }
  };

  const getNotificationMessage = (topic: string) => {
    switch (topic) {
      case 'orders/create': return 'A new order has been placed in your store';
      case 'orders/paid': return 'An order has been paid';
      case 'orders/fulfilled': return 'An order has been fulfilled';
      case 'products/create': return 'A new product has been added to your store';
      case 'products/update': return 'A product has been updated';
      case 'customers/create': return 'A new customer has registered';
      default: return 'A new webhook event has been processed';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full bg-white border border-gray-200 rounded-lg shadow-lg transform transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className={`flex-shrink-0 w-8 h-8 ${getNotificationColor(event.topic)} rounded-full flex items-center justify-center text-white text-sm`}>
            {getNotificationIcon(event.topic)}
          </div>
          <div className="ml-3 flex-1">
            <h4 className="text-sm font-medium text-gray-900">
              {getNotificationTitle(event.topic)}
            </h4>
            <p className="text-sm text-gray-500 mt-1">
              {getNotificationMessage(event.topic)}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(event.created_at).toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
