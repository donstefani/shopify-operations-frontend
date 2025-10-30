import { useProductSync } from '@/hooks/useProductSync';
import { useState } from 'react';

/**
 * Component for syncing products from Shopify to database
 * 
 * This component provides a UI for triggering the bulk product import/sync.
 * It shows the sync progress and results.
 */
export function ProductSyncCard() {
  const { syncProducts, loading, error, data } = useProductSync();
  const [showDetails, setShowDetails] = useState(false);

  const handleSync = async () => {
    try {
      await syncProducts();
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  return (
    <div className="p-6 bg-card border rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Product Sync</h3>
          <p className="text-sm text-muted-foreground">
            Import all products from Shopify to your database
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Syncing...' : 'Sync Products'}
        </button>
      </div>

      {loading && (
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-muted-foreground">
              Syncing products from Shopify...
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            <strong>Sync Failed:</strong> {error}
          </p>
        </div>
      )}

      {data && (
        <div className="space-y-3">
          <div className={`p-3 rounded-md ${
            data.success ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  data.success ? 'text-green-800' : 'text-yellow-800'
                }`}>
                  {data.success ? '✅ Sync Completed Successfully' : '⚠️ Sync Completed with Errors'}
                </p>
                <p className={`text-xs ${
                  data.success ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {data.message}
                </p>
              </div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {showDetails ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-2 bg-blue-50 rounded">
              <p className="text-2xl font-bold text-blue-600">{data.imported}</p>
              <p className="text-xs text-blue-600">Imported</p>
            </div>
            <div className="p-2 bg-green-50 rounded">
              <p className="text-2xl font-bold text-green-600">{data.updated}</p>
              <p className="text-xs text-green-600">Updated</p>
            </div>
            <div className="p-2 bg-red-50 rounded">
              <p className="text-2xl font-bold text-red-600">{data.errors}</p>
              <p className="text-xs text-red-600">Errors</p>
            </div>
          </div>

          {showDetails && data.details && data.details.length > 0 && (
            <div className="mt-4 max-h-60 overflow-y-auto">
              <h4 className="text-sm font-medium mb-2">Sync Details:</h4>
              <div className="space-y-1">
                {data.details.slice(0, 10).map((detail: { action: string; shopifyId: string; title: string; error?: string }, index: number) => (
                  <div key={index} className="flex items-center space-x-2 text-xs">
                    <span className={`w-2 h-2 rounded-full ${
                      detail.action === 'imported' ? 'bg-blue-500' :
                      detail.action === 'updated' ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    <span className="flex-1 truncate">{detail.title}</span>
                    <span className="text-muted-foreground">{detail.action}</span>
                  </div>
                ))}
                {data.details.length > 10 && (
                  <p className="text-xs text-muted-foreground text-center">
                    ... and {data.details.length - 10} more
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 text-xs text-muted-foreground">
        <p>
          💡 <strong>Tip:</strong> This will import all products from your Shopify store. 
          Existing products will be updated with the latest data.
        </p>
      </div>
    </div>
  );
}
