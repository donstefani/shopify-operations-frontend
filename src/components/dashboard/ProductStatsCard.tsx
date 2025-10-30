import { useProductStats } from '@/hooks/useProductStats';

/**
 * Component that displays product statistics
 * 
 * This is a simple example showing:
 * 1. How to use a custom hook (useProductStats)
 * 2. How to handle loading state
 * 3. How to handle errors
 * 4. How to display the data
 */
export function ProductStatsCard() {
  const { data: stats, loading, error } = useProductStats('don-stefani-demo-store.myshopify.com');

  // While data is being fetched, show a loading state
  if (loading) {
    return (
      <div className="p-6 bg-card border rounded-lg shadow-sm animate-pulse">
        <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-muted rounded w-1/3"></div>
      </div>
    );
  }

  // If there's an error, show it to the user
  if (error) {
    return (
      <div className="p-6 bg-card border rounded-lg shadow-sm border-destructive">
        <p className="text-sm font-medium text-destructive">Error Loading Products</p>
        <p className="text-xs text-muted-foreground mt-1">{error}</p>
      </div>
    );
  }

  // Display the actual data
  return (
    <div className="p-6 bg-card border rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Total Products</p>
          <p className="text-3xl font-bold mt-2">{stats?.total || 0}</p>
          <div className="flex gap-4 text-sm mt-3 text-muted-foreground">
            <span className="text-green-600">
              ● Active: {stats?.byStatus.active || 0}
            </span>
            <span className="text-yellow-600">
              ● Draft: {stats?.byStatus.draft || 0}
            </span>
            <span className="text-gray-600">
              ● Archived: {stats?.byStatus.archived || 0}
            </span>
          </div>
        </div>
        <div className="w-12 h-12 rounded-full bg-blue-500 opacity-10"></div>
      </div>
    </div>
  );
}

