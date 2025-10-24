import { useState, useEffect, useCallback } from 'react';
import { orderClient, GET_ORDER_STATS } from '@/lib/graphql-client';
import { SHOP_DOMAIN } from '@/lib/constants';

/**
 * Hook for fetching order statistics
 * 
 * This hook fetches order statistics from the GraphQL API
 * to show accurate counts in the dashboard.
 */

export interface OrderStats {
  total: number;
  totalRevenue: number;
  byStatus: {
    pending: number;
    paid: number;
    fulfilled: number;
    cancelled: number;
  };
}

export interface UseOrderStatsOptions {
  /** Shop domain to fetch stats for */
  shopDomain?: string;
  /** Whether to auto-refresh */
  autoRefresh?: boolean;
  /** Polling interval for auto-refresh (default: 30000ms = 30 seconds) */
  pollInterval?: number;
}

export interface UseOrderStatsReturn {
  /** Order statistics */
  stats: OrderStats | null;
  /** Whether data is currently loading */
  loading: boolean;
  /** Error message if any */
  error: string | null;
  /** Manually refresh the data */
  refresh: () => Promise<void>;
  /** Last time data was fetched */
  lastFetched: Date | null;
}

export function useOrderStats(options: UseOrderStatsOptions = {}): UseOrderStatsReturn {
  const {
    shopDomain = SHOP_DOMAIN,
    autoRefresh = true,
    pollInterval = 30000
  } = options;

  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  /**
   * Fetch order stats from the API
   */
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const variables = { shopDomain };
      const response = await orderClient.request(GET_ORDER_STATS, variables);
      
      setStats(response.orderStats);
      setLastFetched(new Date());
    } catch (err) {
      console.error('Error fetching order stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch order stats');
      
      // Fallback to mock stats if the API fails
      setStats({
        total: 0,
        totalRevenue: 0,
        byStatus: {
          pending: 0,
          paid: 0,
          fulfilled: 0,
          cancelled: 0
        }
      });
    } finally {
      setLoading(false);
    }
  }, [shopDomain]);

  // Effect to fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Effect to set up auto-refresh polling
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchStats, pollInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, pollInterval, fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
    lastFetched
  };
}
