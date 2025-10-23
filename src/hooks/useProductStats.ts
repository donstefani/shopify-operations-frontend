import { useQuery } from '@apollo/client';
import { GET_PRODUCT_STATS } from '../graphql/queries/products';
import { productClient } from '../lib/apollo-client';
import { SHOP_DOMAIN } from '../lib/constants';

/**
 * Hook to fetch product statistics
 * 
 * Usage:
 *   const { stats, loading, error } = useProductStats();
 * 
 * Returns:
 *   - stats: { total, byStatus: { active, draft, archived } }
 *   - loading: boolean (true while fetching)
 *   - error: Error object if request failed
 */
export function useProductStats() {
  const { data, loading, error } = useQuery(GET_PRODUCT_STATS, {
    client: productClient,
    variables: {
      shopDomain: SHOP_DOMAIN,
    },
    // Automatically refetch every 30 seconds for real-time updates
    pollInterval: 30000,
  });

  return {
    stats: data?.productStats,
    loading,
    error,
  };
}

