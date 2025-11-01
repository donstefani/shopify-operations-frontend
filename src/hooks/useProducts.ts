import { useState, useEffect, useCallback } from 'react';
import { productClient } from '@/lib/graphql-client';
import { GET_PRODUCTS } from '@/graphql/queries/products';
import { SHOP_DOMAIN } from '@/lib/constants';

/**
 * Hook for fetching products data with webhook-triggered refresh
 * 
 * This hook fetches products data and can be refreshed when webhook events
 * indicate that product data has changed.
 */

export interface Product {
  id: string;
  shopifyId: string;
  title: string;
  handle: string;
  vendor: string | null;
  productType: string | null;
  price: number;
  inventoryQuantity: number | null;
  status: string;
  syncStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UseProductsOptions {
  /** Shop domain to fetch products for */
  shopDomain?: string;
  /** Whether to auto-refresh on webhook events */
  autoRefresh?: boolean;
  /** Polling interval for auto-refresh (default: 30000ms = 30 seconds) */
  pollInterval?: number;
  /** Limit for number of products to fetch */
  limit?: number;
  /** Cursor for pagination */
  cursor?: string | null;
}

export interface UseProductsReturn {
  /** Array of products */
  products: Product[];
  /** Whether data is currently loading */
  loading: boolean;
  /** Error message if any */
  error: string | null;
  /** Manually refresh the data */
  refresh: () => Promise<void>;
  /** Last time data was fetched */
  lastFetched: Date | null;
  /** Total count of products */
  totalCount: number;
  /** Pagination info */
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const {
    shopDomain = SHOP_DOMAIN,
    autoRefresh = true,
    pollInterval = 30000,
    limit = 50,
    cursor = null
  } = options;

  const [products, setProducts] = useState<Product[]>([]);
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
   * Fetch products from the API
   */
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const variables = {
        shopDomain,
        limit,
        cursor: cursor || undefined
      };

      const response = await productClient.request<{
        products: {
          items: Product[];
          totalCount: number;
          pageInfo: {
            hasNextPage: boolean;
            endCursor: string | null;
          };
        };
      }>(GET_PRODUCTS, variables);
      
      // Transform the GraphQL response to match our Product interface
      const fetchedProducts: Product[] = response.products.items.map((product: any) => ({
        id: product.id,
        shopifyId: product.shopifyId,
        title: product.title,
        handle: product.handle,
        vendor: product.vendor || null,
        productType: product.productType || null,
        price: product.price || 0,
        inventoryQuantity: product.inventoryQuantity || null,
        status: product.status || 'active',
        syncStatus: product.syncStatus || null,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      }));

      setProducts(fetchedProducts);
      setTotalCount(response.products.totalCount);
      setPageInfo(response.products.pageInfo);
      setLastFetched(new Date());
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [shopDomain, limit, cursor]);

  // Effect to fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Effect to set up auto-refresh polling
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchProducts, pollInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, pollInterval, fetchProducts]);

  return {
    products,
    loading,
    error,
    refresh: fetchProducts,
    lastFetched,
    totalCount,
    pageInfo
  };
}

