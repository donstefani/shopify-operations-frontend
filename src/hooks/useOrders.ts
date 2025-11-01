import { useState, useEffect, useCallback } from 'react';
import { orderClient } from '@/lib/graphql-client';
import { SHOP_DOMAIN } from '@/lib/constants';

/**
 * Hook for fetching orders data with webhook-triggered refresh
 * 
 * This hook fetches orders data and can be refreshed when webhook events
 * indicate that order data has changed.
 */

export interface Order {
  id: string;
  shopifyId: string;
  orderNumber: string;
  customerName: string;
  totalPrice: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface UseOrdersOptions {
  /** Shop domain to fetch orders for */
  shopDomain?: string;
  /** Whether to auto-refresh on webhook events */
  autoRefresh?: boolean;
  /** Polling interval for auto-refresh (default: 30000ms = 30 seconds) */
  pollInterval?: number;
  /** Limit for number of orders to fetch */
  limit?: number;
  /** Cursor for pagination */
  cursor?: string | null;
}

export interface UseOrdersReturn {
  /** Array of orders */
  orders: Order[];
  /** Whether data is currently loading */
  loading: boolean;
  /** Error message if any */
  error: string | null;
  /** Manually refresh the data */
  refresh: () => Promise<void>;
  /** Last time data was fetched */
  lastFetched: Date | null;
  /** Total count of orders */
  totalCount: number;
  /** Pagination info */
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
}

export function useOrders(options: UseOrdersOptions = {}): UseOrdersReturn {
  const {
    shopDomain = SHOP_DOMAIN,
    autoRefresh = true,
    pollInterval = 30000,
    limit = 50,
    cursor = null
  } = options;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageInfo, setPageInfo] = useState<{
    hasNextPage: boolean;
    endCursor: string | null;
  }>({
    hasNextPage: false,
    endCursor: null
  });

  /**
   * Fetch orders from the API
   */
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // GraphQL query to fetch orders
      const query = `
        query GetOrders($shopDomain: String!, $limit: Int, $cursor: String) {
          orders(shopDomain: $shopDomain, limit: $limit, cursor: $cursor) {
            items {
              id
              shopifyId
              orderNumber
              customerEmail
              totalPrice
              currency
              status
              fulfillmentStatus
              financialStatus
              createdAt
              updatedAt
            }
            pageInfo {
              hasNextPage
              endCursor
            }
            totalCount
          }
        }
      `;

      const variables = {
        shopDomain,
        limit,
        cursor: cursor || undefined
      };

      const response = await orderClient.request(query, variables);
      
      // Transform the GraphQL response to match our Order interface
      const orders: Order[] = response.orders.items.map((order: any) => ({
        id: order.id,
        shopifyId: order.shopifyId,
        orderNumber: order.orderNumber,
        customerName: order.customerEmail || 'Unknown Customer', // Use email as name for now
        totalPrice: `${order.currency} ${order.totalPrice.toFixed(2)}`,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }));

      setOrders(orders);
      setTotalCount(response.orders.totalCount);
      setPageInfo(response.orders.pageInfo || { hasNextPage: false, endCursor: null });
      setLastFetched(new Date());
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [shopDomain, limit, cursor]);

  // Effect to fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Effect to set up auto-refresh polling
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchOrders, pollInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, pollInterval, fetchOrders]);

  return {
    orders,
    loading,
    error,
    refresh: fetchOrders,
    lastFetched,
    totalCount,
    pageInfo
  };
}
