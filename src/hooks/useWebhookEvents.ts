import { useState, useEffect, useCallback, useRef } from 'react';
import { eventClient, WebhookEvent, WebhookEventStats } from '@/lib/event-client';
import { SHOP_DOMAIN } from '@/lib/constants';

/**
 * Hook for fetching and polling webhook events
 * 
 * This hook provides real-time webhook event data with automatic polling
 * and the ability to filter by topic and control polling behavior.
 * 
 * Usage:
 *   const { events, stats, loading, error, refresh } = useWebhookEvents({
 *     topic: 'orders/create',
 *     pollInterval: 5000,
 *     autoStart: true
 *   });
 */

export interface UseWebhookEventsOptions {
  /** Shop domain to fetch events for */
  shopDomain?: string;
  /** Filter events by topic (e.g., 'orders/create', 'products/update') */
  topic?: string;
  /** Polling interval in milliseconds (default: 5000ms = 5 seconds) */
  pollInterval?: number;
  /** Whether to start polling automatically (default: true) */
  autoStart?: boolean;
  /** Maximum number of events to fetch (default: 50) */
  limit?: number;
  /** Cursor for pagination */
  cursor?: string | null;
}

export interface UseWebhookEventsReturn {
  /** Array of webhook events */
  events: WebhookEvent[];
  /** Webhook event statistics */
  stats: WebhookEventStats | null;
  /** Whether data is currently loading */
  loading: boolean;
  /** Error message if any */
  error: string | null;
  /** Whether polling is currently active */
  isPolling: boolean;
  /** Manually refresh the data */
  refresh: () => Promise<void>;
  /** Start polling */
  startPolling: () => void;
  /** Stop polling */
  stopPolling: () => void;
  /** Last time data was fetched */
  lastFetched: Date | null;
  /** Total count of events (from stats) */
  totalCount: number;
  /** Pagination info */
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
}

export function useWebhookEvents(options: UseWebhookEventsOptions = {}): UseWebhookEventsReturn {
  const {
    shopDomain = SHOP_DOMAIN,
    topic,
    pollInterval = 5000,
    autoStart = true,
    limit = 50,
    cursor = null
  } = options;

  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [stats, setStats] = useState<WebhookEventStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageInfo, setPageInfo] = useState<{
    hasNextPage: boolean;
    endCursor: string | null;
  }>({
    hasNextPage: false,
    endCursor: null
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  /**
   * Fetch webhook events from the API
   */
  const fetchEvents = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch both events and stats in parallel
      const [eventsResponse, statsResponse] = await Promise.all([
        eventClient.getWebhookEvents(shopDomain, { limit, topic, cursor: cursor || undefined }),
        eventClient.getWebhookEventStats(shopDomain)
      ]);

      if (isMountedRef.current) {
        if (eventsResponse.success) {
          setEvents(eventsResponse.data);
          // Use the last event ID as the cursor for next page
          const lastEvent = eventsResponse.data.length > 0 
            ? eventsResponse.data[eventsResponse.data.length - 1] 
            : null;
          setPageInfo({
            hasNextPage: eventsResponse.pagination?.hasMore || false,
            endCursor: lastEvent?.event_id || null
          });
        } else {
          setError(eventsResponse.message || 'Failed to fetch webhook events');
        }

        if (statsResponse.success) {
          setStats(statsResponse.data);
          setTotalCount(statsResponse.data.total || 0);
        } else {
          console.warn('Failed to fetch webhook stats:', statsResponse.message);
        }

        setLastFetched(new Date());
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error('Error fetching webhook events:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch webhook events');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [shopDomain, topic, limit, cursor]);

  /**
   * Start polling for webhook events
   */
  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setIsPolling(true);
    
    // Fetch immediately
    fetchEvents();
    
    // Then poll at the specified interval
    intervalRef.current = setInterval(fetchEvents, pollInterval);
  }, [fetchEvents, pollInterval]);

  /**
   * Stop polling for webhook events
   */
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  /**
   * Manually refresh the data
   */
  const refresh = useCallback(async () => {
    await fetchEvents();
  }, [fetchEvents]);

  // Effect to handle component mount/unmount and auto-start
  useEffect(() => {
    isMountedRef.current = true;

    if (autoStart) {
      startPolling();
    }

    return () => {
      isMountedRef.current = false;
      stopPolling();
    };
  }, [autoStart, startPolling, stopPolling]);

  // Effect to restart polling when dependencies change
  useEffect(() => {
    if (isPolling) {
      startPolling();
    }
  }, [shopDomain, topic, pollInterval, startPolling, isPolling]);

  return {
    events,
    stats,
    loading,
    error,
    isPolling,
    refresh,
    startPolling,
    stopPolling,
    lastFetched,
    totalCount,
    pageInfo
  };
}

/**
 * Hook for fetching webhook event statistics only (no polling)
 * 
 * This is useful for components that only need stats without real-time updates.
 */
export function useWebhookEventStats(shopDomain: string = SHOP_DOMAIN) {
  const [stats, setStats] = useState<WebhookEventStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await eventClient.getWebhookEventStats(shopDomain);
        
        if (response.success) {
          setStats(response.data);
        } else {
          setError(response.message || 'Failed to fetch webhook event stats');
        }
      } catch (err) {
        console.error('Error fetching webhook event stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch webhook event stats');
      } finally {
        setLoading(false);
      }
    };

    if (shopDomain) {
      fetchStats();
    }
  }, [shopDomain]);

  return { stats, loading, error };
}
