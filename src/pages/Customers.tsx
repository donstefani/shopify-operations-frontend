export function Customers() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer database
          </p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
          Add Customer
        </button>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <p className="text-muted-foreground text-center py-8">
          No customers found. Add your first customer to get started.
        </p>
      </div>
    </div>
  );
}

