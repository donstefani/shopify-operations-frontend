import { ProductStatsCard } from '@/components/dashboard/ProductStatsCard';

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your Shopify Operations Manager
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Real data from GraphQL! */}
        <ProductStatsCard />
        
        {/* Placeholders for now - we'll add these next */}
        {[
          { label: 'Total Orders', value: '0', color: 'bg-green-500' },
          { label: 'Total Customers', value: '0', color: 'bg-purple-500' },
          { label: 'Recent Events', value: '0', color: 'bg-orange-500' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-6 bg-card border rounded-lg shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-full ${stat.color} opacity-10`}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Webhook Events</h2>
        <p className="text-muted-foreground">
          No recent webhook events. Events will appear here as they are processed.
        </p>
      </div>
    </div>
  );
}

