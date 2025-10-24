import { NotificationToast } from './NotificationToast';
import { useWebhookNotifications } from '@/hooks/useWebhookNotifications';

/**
 * Notification Container Component
 * 
 * Manages and displays webhook event notifications throughout the app.
 * Shows toast notifications for important events like new orders.
 */
export function NotificationContainer() {
  const {
    notifications,
    dismissNotification,
    notificationsEnabled,
    toggleNotifications
  } = useWebhookNotifications({
    showOrderNotifications: true,
    showProductNotifications: false, // Disable for now to reduce noise
    showCustomerNotifications: false, // Disable for now to reduce noise
    maxHistory: 5
  });

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {/* Notification Toggle Button */}
      <div className="flex justify-end mb-2">
        <button
          onClick={toggleNotifications}
          className={`px-3 py-1 text-xs rounded-full ${
            notificationsEnabled 
              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title={notificationsEnabled ? 'Notifications enabled' : 'Notifications disabled'}
        >
          {notificationsEnabled ? '🔔 On' : '🔕 Off'}
        </button>
      </div>

      {/* Notification Toasts */}
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          event={notification.event}
          notificationId={notification.id}
          onDismiss={dismissNotification}
          autoDismiss={true}
          duration={5000}
        />
      ))}
    </div>
  );
}
