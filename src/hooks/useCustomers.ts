import { useState, useEffect, useCallback } from 'react';
import { customerClient } from '@/lib/graphql-client';
import { SHOP_DOMAIN } from '@/lib/constants';

/**
 * Hook for fetching customers data with webhook-triggered refresh
 * 
 * This hook fetches customers data and can be refreshed when webhook events
 * indicate that customer data has changed.
 */

export interface Customer {
  id: string;
  shopifyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  totalSpent: string;
  ordersCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface UseCustomersOptions {
  /** Shop domain to fetch customers for */
  shopDomain?: string;
  /** Whether to auto-refresh on webhook events */
  autoRefresh?: boolean;
  /** Polling interval for auto-refresh (default: 30000ms = 30 seconds) */
  pollInterval?: number;
  /** Limit for number of customers to fetch */
  limit?: number;
  /** Cursor for pagination */
  cursor?: string | null;
}

export interface UseCustomersReturn {
  /** Array of customers */
  customers: Customer[];
  /** Whether data is currently loading */
  loading: boolean;
  /** Error message if any */
  error: string | null;
  /** Manually refresh the data */
  refresh: () => Promise<void>;
  /** Last time data was fetched */
  lastFetched: Date | null;
  /** Total count of customers */
  totalCount: number;
  /** Pagination info */
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
}

export function useCustomers(options: UseCustomersOptions = {}): UseCustomersReturn {
  const {
    shopDomain = SHOP_DOMAIN,
    autoRefresh = true,
    pollInterval = 30000,
    limit = 50,
    cursor = null
  } = options;

  const [customers, setCustomers] = useState<Customer[]>([]);
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
   * Fetch customers from the API
   */
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const query = `
        query GetCustomers($shopDomain: String!, $limit: Int, $cursor: String) {
          customers(shopDomain: $shopDomain, limit: $limit, cursor: $cursor) {
            items {
              id
              shopifyId
              email
              firstName
              lastName
              phone
              totalSpent
              ordersCount
              state
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

      const response = await customerClient.request(query, variables);

      const customers: Customer[] = response.customers.items.map((customer: any) => ({
        id: customer.id,
        shopifyId: customer.shopifyId,
        firstName: customer.firstName || 'Unknown',
        lastName: customer.lastName || 'Customer',
        email: customer.email,
        phone: customer.phone || '',
        totalSpent: `$${customer.totalSpent.toFixed(2)}`,
        ordersCount: customer.ordersCount,
        status: customer.state.toLowerCase(),
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt
      }));

      setCustomers(customers);
      setTotalCount(response.customers.totalCount);
      setPageInfo(response.customers.pageInfo || { hasNextPage: false, endCursor: null });
      setLastFetched(new Date());
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  }, [shopDomain, limit, cursor]);

  // Effect to fetch customers on mount
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Effect to set up auto-refresh polling
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchCustomers, pollInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, pollInterval, fetchCustomers]);

  return {
    customers,
    loading,
    error,
    refresh: fetchCustomers,
    lastFetched,
    totalCount,
    pageInfo
  };
}
