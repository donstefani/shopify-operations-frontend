import { useState } from 'react';
import { productClient } from '../lib/graphql-client';
import { SHOP_DOMAIN } from '../lib/constants';

// GraphQL mutation for syncing all products
const SYNC_ALL_PRODUCTS = `
  mutation SyncAllProducts($shopDomain: String!) {
    syncAllProducts(shopDomain: $shopDomain) {
      success
      message
      imported
      updated
      errors
      details {
        action
        shopifyId
        title
        error
      }
    }
  }
`;

interface SyncResult {
  success: boolean;
  message: string;
  imported: number;
  updated: number;
  errors: number;
  details: Array<{
    action: string;
    shopifyId: string;
    title: string;
    error?: string;
  }>;
}

/**
 * Hook for syncing all products from Shopify to database
 * 
 * Usage:
 *   const { syncProducts, loading, error, data } = useProductSync();
 *   
 *   const handleSync = async () => {
 *     try {
 *       const result = await syncProducts();
 *       console.log('Sync completed:', result);
 *     } catch (error) {
 *       console.error('Sync failed:', error);
 *     }
 *   };
 * 
 * Returns:
 *   - syncProducts: Function to trigger the sync
 *   - loading: boolean (true while syncing)
 *   - error: Error object if sync failed
 *   - data: Sync result with imported/updated counts
 */
export function useProductSync() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SyncResult | null>(null);

  const syncProducts = async (shopDomain: string = SHOP_DOMAIN): Promise<SyncResult> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Starting product sync...');
      
      const result = await productClient.request<{ syncAllProducts: SyncResult }>(
        SYNC_ALL_PRODUCTS,
        { shopDomain }
      );
      
      const syncResult = result.syncAllProducts;
      setData(syncResult);
      
      console.log('🔄 Product sync completed:', {
        success: syncResult.success,
        imported: syncResult.imported,
        updated: syncResult.updated,
        errors: syncResult.errors,
      });
      
      return syncResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync products';
      setError(errorMessage);
      console.error('❌ Product sync failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    syncProducts,
    loading,
    error,
    data,
  };
}
