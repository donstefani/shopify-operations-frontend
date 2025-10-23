export function Events() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Webhook Events</h1>
        <p className="text-muted-foreground">
          View all webhook events from Shopify
        </p>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <p className="text-muted-foreground text-center py-8">
          No webhook events found. Events will appear here as they are processed.
        </p>
      </div>
    </div>
  );
}

