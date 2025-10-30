import { useState, useEffect } from 'react';
import { productClient, GET_PRODUCT_STATS } from '../lib/graphql-client';

interface ProductStats {
  total: number;
  byStatus: {
    active: number;
    draft: number;
    archived: number;
  };
}

export const useProductStats = (shopDomain: string) => {
  const [data, setData] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await productClient.request<{ productStats: ProductStats }>(
          GET_PRODUCT_STATS,
          { shopDomain }
        );
        
        setData(result.productStats);
      } catch (err) {
        console.error('Error fetching product stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch product stats');
      } finally {
        setLoading(false);
      }
    };

    if (shopDomain) {
      fetchStats();
    }
  }, [shopDomain]);

  return { data, loading, error };
};