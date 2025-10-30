import { useState, useEffect } from 'react';
import { useProductStats } from '@/hooks/useProductStats';
import { SHOP_DOMAIN } from '@/lib/constants';

/**
 * Products Page Component
 * 
 * Displays product data with real-time updates from webhook events.
 * Shows product statistics and management options.
 */
export function Products() {
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const { data: productStats, loading, error } = useProductStats(SHOP_DOMAIN);

  const handleRefresh = () => {
    setLastRefreshed(new Date());
    // The useProductStats hook will automatically refetch when the component re-renders
    // In a real implementation, you'd trigger a refetch here
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            Manage your store's product catalog
            {lastRefreshed && (
              <span className="ml-2 text-sm">
                (Last refreshed: {formatTime(lastRefreshed)})
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
            Create Product
          </button>
        </div>
      </div>

      {/* Product Stats */}
      {productStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-6 bg-card border rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <p className="text-3xl font-bold mt-2">{productStats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500 opacity-10"></div>
            </div>
          </div>
          
          <div className="p-6 bg-card border rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-3xl font-bold mt-2">{productStats.byStatus.active}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500 opacity-10"></div>
            </div>
          </div>
          
          <div className="p-6 bg-card border rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Draft</p>
                <p className="text-3xl font-bold mt-2">{productStats.byStatus.draft}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-500 opacity-10"></div>
            </div>
          </div>
          
          <div className="p-6 bg-card border rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Archived</p>
                <p className="text-3xl font-bold mt-2">{productStats.byStatus.archived}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-gray-500 opacity-10"></div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}

      {/* Products List Placeholder */}
      <div className="bg-card border rounded-lg p-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Product list view coming soon. Currently showing product statistics above.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Total products: {productStats?.total || 0} | 
              Active: {productStats?.byStatus.active || 0} | 
              Draft: {productStats?.byStatus.draft || 0} | 
              Archived: {productStats?.byStatus.archived || 0}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

