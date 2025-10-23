export function Orders() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">
          View and manage customer orders
        </p>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <p className="text-muted-foreground text-center py-8">
          No orders found. Orders will appear here once customers make purchases.
        </p>
      </div>
    </div>
  );
}

