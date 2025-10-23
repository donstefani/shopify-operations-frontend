export function Products() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            Manage your store's product catalog
          </p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
          Create Product
        </button>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <p className="text-muted-foreground text-center py-8">
          No products found. Create your first product to get started.
        </p>
      </div>
    </div>
  );
}

