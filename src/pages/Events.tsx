import { useState } from 'react';
import { useWebhookEvents } from '@/hooks/useWebhookEvents';
import { WebhookEvent } from '@/lib/event-client';

/**
 * Events Page Component
 * 
 * Displays real-time webhook events from Shopify with filtering and polling controls.
 * Shows events as they happen in the store with detailed information.
 */
export function Events() {
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [pollInterval, setPollInterval] = useState<number>(5000);
  const [isPollingEnabled, setIsPollingEnabled] = useState(true);

  const { 
    events, 
    stats, 
    loading, 
    error, 
    isPolling, 
    refresh, 
    startPolling, 
    stopPolling,
    lastFetched 
  } = useWebhookEvents({
    topic: selectedTopic || undefined,
    pollInterval,
    autoStart: isPollingEnabled
  });

  // Available webhook topics for filtering
  const webhookTopics = [
    { value: '', label: 'All Events' },
    { value: 'orders/create', label: 'Orders Created' },
    { value: 'orders/updated', label: 'Orders Updated' },
    { value: 'orders/paid', label: 'Orders Paid' },
    { value: 'orders/cancelled', label: 'Orders Cancelled' },
    { value: 'orders/fulfilled', label: 'Orders Fulfilled' },
    { value: 'products/create', label: 'Products Created' },
    { value: 'products/update', label: 'Products Updated' },
    { value: 'products/delete', label: 'Products Deleted' },
    { value: 'customers/create', label: 'Customers Created' },
    { value: 'customers/update', label: 'Customers Updated' },
  ];

  const formatEventTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getEventIcon = (topic: string) => {
    if (topic.startsWith('orders/')) return '🛒';
    if (topic.startsWith('products/')) return '📦';
    if (topic.startsWith('customers/')) return '👤';
    return '🔔';
  };

  const getEventStatusColor = (status: string) => {
    switch (status) {
      case 'processed': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Webhook Events</h1>
          <p className="text-muted-foreground">
            Real-time webhook events from Shopify
            {lastFetched && (
              <span className="ml-2 text-sm">
                (Last updated: {formatEventTime(lastFetched.toISOString())})
              </span>
            )}
          </p>
        </div>
        
        {/* Polling Controls */}
        <div className="flex items-center space-x-4">
          <button
            onClick={isPolling ? stopPolling : startPolling}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              isPolling 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isPolling ? 'Stop Polling' : 'Start Polling'}
          </button>
          
          <button
            onClick={refresh}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-card border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="w-8 h-8 bg-blue-500 rounded-full opacity-10"></div>
            </div>
          </div>
          
          <div className="p-4 bg-card border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Orders</p>
                <p className="text-2xl font-bold">
                  {(stats.byTopic['orders/create'] || 0) + 
                   (stats.byTopic['orders/updated'] || 0) + 
                   (stats.byTopic['orders/paid'] || 0)}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-500 rounded-full opacity-10"></div>
            </div>
          </div>
          
          <div className="p-4 bg-card border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Products</p>
                <p className="text-2xl font-bold">
                  {(stats.byTopic['products/create'] || 0) + 
                   (stats.byTopic['products/update'] || 0)}
                </p>
              </div>
              <div className="w-8 h-8 bg-purple-500 rounded-full opacity-10"></div>
            </div>
          </div>
          
          <div className="p-4 bg-card border rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Customers</p>
                <p className="text-2xl font-bold">
                  {(stats.byTopic['customers/create'] || 0) + 
                   (stats.byTopic['customers/update'] || 0)}
                </p>
              </div>
              <div className="w-8 h-8 bg-orange-500 rounded-full opacity-10"></div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div>
          <label htmlFor="topic-filter" className="block text-sm font-medium text-muted-foreground mb-1">
            Filter by Topic
          </label>
          <select
            id="topic-filter"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {webhookTopics.map((topic) => (
              <option key={topic.value} value={topic.value}>
                {topic.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="poll-interval" className="block text-sm font-medium text-muted-foreground mb-1">
            Poll Interval (ms)
          </label>
          <select
            id="poll-interval"
            value={pollInterval}
            onChange={(e) => setPollInterval(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={2000}>2 seconds</option>
            <option value={5000}>5 seconds</option>
            <option value={10000}>10 seconds</option>
            <option value={30000}>30 seconds</option>
          </select>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {/* Events List */}
      <div className="bg-card border rounded-lg">
        {loading && events.length === 0 ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading webhook events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">
              No webhook events found{selectedTopic && ` for topic: ${selectedTopic}`}.
              Events will appear here as they are processed.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {events.map((event: WebhookEvent) => (
              <div key={event.event_id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{getEventIcon(event.topic)}</span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">
                          {event.topic.replace('/', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEventStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatEventTime(event.created_at)}
                      </p>
                      {event.error_message && (
                        <p className="text-sm text-red-600 mt-1">
                          Error: {event.error_message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">ID: {event.event_id}</p>
                    <p className="text-sm text-gray-500">Shop: {event.shop_domain}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

