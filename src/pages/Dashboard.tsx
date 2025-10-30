import { ProductStatsCard } from '@/components/dashboard/ProductStatsCard';
import { useWebhookEvents } from '@/hooks/useWebhookEvents';
import { useOrderStats } from '@/hooks/useOrderStats';
import { WebhookEvent } from '@/lib/event-client';

/**
 * Dashboard Component
 * 
 * Main dashboard showing real-time statistics and recent webhook events.
 * Provides an overview of store activity with live updates.
 */
export function Dashboard() {
  // Fetch recent webhook events for the dashboard (last 10 events, poll every 10 seconds)
  const { 
    events: recentEvents, 
    stats: eventStats, 
    loading: eventsLoading,
    error: eventsError,
    lastFetched 
  } = useWebhookEvents({
    limit: 10,
    pollInterval: 10000, // Poll every 10 seconds for dashboard
    autoStart: true
  });

  // Fetch real order statistics from GraphQL API
  const { 
    stats: orderStats, 
    loading: orderStatsLoading,
    error: orderStatsError,
    lastFetched: orderStatsLastFetched 
  } = useOrderStats({
    autoRefresh: true,
    pollInterval: 30000 // Poll every 30 seconds for order stats
  });

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
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your Shopify Operations Manager
          {(lastFetched || orderStatsLastFetched) && (
            <span className="ml-2 text-sm">
              (Last updated: {formatEventTime((orderStatsLastFetched || lastFetched)!.toISOString())})
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Real data from GraphQL! */}
        <ProductStatsCard />
        
        {/* Real order statistics from GraphQL API */}
        <div className="p-6 bg-card border rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Orders
              </p>
              <p className="text-3xl font-bold mt-2">
                {orderStatsLoading ? (
                  <span className="text-gray-400">Loading...</span>
                ) : orderStatsError ? (
                  <span className="text-red-400">Error</span>
                ) : orderStats ? (
                  orderStats.total
                ) : (
                  '0'
                )}
              </p>
              {orderStats && (
                <p className="text-xs text-muted-foreground mt-1">
                  Revenue: ${orderStats.totalRevenue.toFixed(2)}
                </p>
              )}
            </div>
            <div className="w-12 h-12 rounded-full bg-green-500 opacity-10"></div>
          </div>
        </div>

        <div className="p-6 bg-card border rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Customers
              </p>
              <p className="text-3xl font-bold mt-2">
                {eventStats ? 
                  (eventStats.byTopic['customers/create'] || 0) + 
                  (eventStats.byTopic['customers/update'] || 0) : 
                  '0'
                }
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-500 opacity-10"></div>
          </div>
        </div>

        <div className="p-6 bg-card border rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Recent Events
              </p>
              <p className="text-3xl font-bold mt-2">
                {eventStats?.total || 0}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-500 opacity-10"></div>
          </div>
        </div>
      </div>

      {/* Recent Webhook Events */}
      <div className="bg-card border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Webhook Events</h2>
          {eventsLoading && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-muted-foreground">Updating...</span>
            </div>
          )}
        </div>

        {eventsError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              <strong>Error loading events:</strong> {eventsError}
            </p>
          </div>
        )}

        {recentEvents.length === 0 ? (
          <p className="text-muted-foreground">
            No recent webhook events. Events will appear here as they are processed.
          </p>
        ) : (
          <div className="space-y-3">
            {recentEvents.slice(0, 5).map((event: WebhookEvent) => (
              <div key={event.event_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{getEventIcon(event.topic)}</span>
                  <div>
                    <p className="font-medium text-sm">
                      {event.topic.replace('/', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatEventTime(event.created_at)}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEventStatusColor(event.status || 'processed')}`}>
                  {event.status || 'processed'}
                </span>
              </div>
            ))}
            
            {recentEvents.length > 5 && (
              <p className="text-sm text-muted-foreground text-center pt-2">
                Showing 5 of {recentEvents.length} recent events
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

