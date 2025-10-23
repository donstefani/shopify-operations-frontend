# Apollo Client Tutorial for Beginners

## What is Apollo Client?

Apollo Client is a library that makes it easy to fetch data from GraphQL APIs in React. It handles:
- **Fetching data** from your GraphQL server
- **Caching** results so you don't re-fetch unnecessarily  
- **Loading states** (showing spinners while data loads)
- **Error handling** (what to do when things go wrong)
- **Mutations** (creating, updating, deleting data)

Think of it like using `fetch()` or `axios`, but with superpowers for GraphQL.

## Setup (Already Done!)

We've already set up Apollo Client in `src/lib/apollo-client.ts`. It creates 4 separate clients - one for each backend service.

## Part 1: Reading Data (Queries)

### The Pattern

1. **Write a GraphQL query** - tells the server what data you want
2. **Use the `useQuery` hook** - runs the query and gives you data
3. **Handle loading/error/data states** - show appropriate UI

### Example 1: Fetching Product Stats

Let's fetch stats for the dashboard. This is the simplest example.

**Step 1: Create the GraphQL Query**

Create `src/graphql/queries/products.ts`:

```typescript
import { gql } from '@apollo/client';

// This is a GraphQL query - it asks for product statistics
export const GET_PRODUCT_STATS = gql`
  query GetProductStats($shopDomain: String!) {
    productStats(shopDomain: $shopDomain) {
      total
      byStatus {
        active
        draft
        archived
      }
    }
  }
`;
```

**What's happening here?**
- `gql` - Template tag that marks this as GraphQL
- `query GetProductStats` - Name of our query (can be anything)
- `$shopDomain: String!` - Variable we'll pass in (the `!` means required)
- Inside `{ }` - The exact fields we want back from the server

**Step 2: Create a Custom Hook**

Create `src/hooks/useProductStats.ts`:

```typescript
import { useQuery } from '@apollo/client';
import { GET_PRODUCT_STATS } from '../graphql/queries/products';
import { productClient } from '../lib/apollo-client';
import { SHOP_DOMAIN } from '../lib/constants';

export function useProductStats() {
  const { data, loading, error } = useQuery(GET_PRODUCT_STATS, {
    client: productClient, // Which Apollo client to use
    variables: { 
      shopDomain: SHOP_DOMAIN // Pass in our shop domain
    },
  });

  return {
    stats: data?.productStats, // The actual stats (undefined if loading)
    loading,                    // true while fetching
    error,                      // error object if something went wrong
  };
}
```

**What's happening here?**
- `useQuery` - React hook from Apollo Client
- First argument - the query we wrote
- `client: productClient` - tells Apollo which backend to use
- `variables` - data we're passing to the query
- Returns - `data`, `loading`, `error` - everything we need

**Step 3: Use it in a Component**

Create `src/components/dashboard/ProductStatsCard.tsx`:

```typescript
import { useProductStats } from '@/hooks/useProductStats';

export function ProductStatsCard() {
  const { stats, loading, error } = useProductStats();

  // Show loading spinner
  if (loading) {
    return (
      <div className="p-6 bg-card border rounded-lg">
        <p>Loading...</p>
      </div>
    );
  }

  // Show error message
  if (error) {
    return (
      <div className="p-6 bg-card border rounded-lg">
        <p className="text-red-500">Error: {error.message}</p>
      </div>
    );
  }

  // Show the data!
  return (
    <div className="p-6 bg-card border rounded-lg">
      <h3 className="text-sm font-medium text-muted-foreground">Total Products</h3>
      <p className="text-3xl font-bold mt-2">{stats?.total || 0}</p>
      <div className="text-sm mt-2 text-muted-foreground">
        <span>Active: {stats?.byStatus.active || 0}</span> | 
        <span>Draft: {stats?.byStatus.draft || 0}</span> | 
        <span>Archived: {stats?.byStatus.archived || 0}</span>
      </div>
    </div>
  );
}
```

**What's happening here?**
- Call `useProductStats()` - returns stats, loading, error
- Check `loading` first - show spinner while fetching
- Check `error` next - show error message if failed
- Finally show `data` - the actual stats

That's it! You just fetched data from GraphQL! 🎉

### Example 2: Fetching a List of Products

Now let's fetch a list of products with pagination.

**Step 1: The Query**

Add to `src/graphql/queries/products.ts`:

```typescript
export const GET_PRODUCTS = gql`
  query GetProducts($shopDomain: String!, $limit: Int, $cursor: String) {
    products(shopDomain: $shopDomain, limit: $limit, cursor: $cursor) {
      items {
        id
        shopifyId
        title
        vendor
        price
        inventoryQuantity
        status
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;
```

**Step 2: The Hook**

Create `src/hooks/useProducts.ts`:

```typescript
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '../graphql/queries/products';
import { productClient } from '../lib/apollo-client';
import { SHOP_DOMAIN } from '../lib/constants';

export function useProducts(limit = 20, cursor?: string) {
  const { data, loading, error, fetchMore } = useQuery(GET_PRODUCTS, {
    client: productClient,
    variables: { 
      shopDomain: SHOP_DOMAIN,
      limit,
      cursor,
    },
  });

  // Function to load more products (pagination)
  const loadMore = () => {
    if (data?.products.pageInfo.hasNextPage) {
      fetchMore({
        variables: {
          cursor: data.products.pageInfo.endCursor,
        },
      });
    }
  };

  return {
    products: data?.products.items || [],
    pageInfo: data?.products.pageInfo,
    totalCount: data?.products.totalCount || 0,
    loading,
    error,
    loadMore,
  };
}
```

**Step 3: The Component**

Create `src/components/products/ProductList.tsx`:

```typescript
import { useProducts } from '@/hooks/useProducts';

export function ProductList() {
  const { products, loading, error, pageInfo, loadMore } = useProducts();

  if (loading && products.length === 0) {
    return <div>Loading products...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (products.length === 0) {
    return <div>No products found</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Products</h2>
      
      <div className="grid gap-4">
        {products.map((product) => (
          <div key={product.id} className="p-4 border rounded-lg">
            <h3 className="font-semibold">{product.title}</h3>
            <p className="text-sm text-muted-foreground">
              {product.vendor} • ${product.price} • {product.inventoryQuantity} in stock
            </p>
            <span className="text-xs bg-primary/10 px-2 py-1 rounded">
              {product.status}
            </span>
          </div>
        ))}
      </div>

      {pageInfo?.hasNextPage && (
        <button 
          onClick={loadMore}
          disabled={loading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded"
        >
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

## Part 2: Writing Data (Mutations)

Mutations are for **creating, updating, or deleting** data.

### Example: Creating a Product

**Step 1: The Mutation**

Create `src/graphql/mutations/products.ts`:

```typescript
import { gql } from '@apollo/client';

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($shopDomain: String!, $input: CreateProductInput!) {
    createProduct(shopDomain: $shopDomain, input: $input) {
      id
      shopifyId
      title
      status
      syncStatus
    }
  }
`;
```

**Step 2: The Hook**

Add to `src/hooks/useProducts.ts`:

```typescript
import { useMutation } from '@apollo/client';
import { CREATE_PRODUCT } from '../graphql/mutations/products';
import { GET_PRODUCTS } from '../graphql/queries/products';

export function useCreateProduct() {
  const [mutate, { loading, error }] = useMutation(CREATE_PRODUCT, {
    client: productClient,
    // After creating, refetch the products list
    refetchQueries: [
      { 
        query: GET_PRODUCTS, 
        variables: { shopDomain: SHOP_DOMAIN } 
      }
    ],
  });

  const createProduct = async (input: {
    title: string;
    handle: string;
    price: number;
    inventoryQuantity: number;
    status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
    vendor?: string;
    productType?: string;
    tags?: string[];
  }) => {
    try {
      const result = await mutate({
        variables: {
          shopDomain: SHOP_DOMAIN,
          input,
        },
      });
      return result.data?.createProduct;
    } catch (err) {
      console.error('Error creating product:', err);
      throw err;
    }
  };

  return { createProduct, loading, error };
}
```

**Step 3: The Form Component**

Create `src/components/products/CreateProductForm.tsx`:

```typescript
import { useState } from 'react';
import { useCreateProduct } from '@/hooks/useProducts';

export function CreateProductForm({ onSuccess }: { onSuccess: () => void }) {
  const { createProduct, loading, error } = useCreateProduct();
  
  const [formData, setFormData] = useState({
    title: '',
    handle: '',
    price: 0,
    inventoryQuantity: 0,
    status: 'DRAFT' as const,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createProduct(formData);
      alert('Product created successfully!');
      onSuccess();
    } catch (err) {
      // Error is already in the `error` variable from the hook
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mt-1 block w-full rounded-md border p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Handle (URL slug)</label>
        <input
          type="text"
          value={formData.handle}
          onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
          className="mt-1 block w-full rounded-md border p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Price</label>
        <input
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
          className="mt-1 block w-full rounded-md border p-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Inventory</label>
        <input
          type="number"
          value={formData.inventoryQuantity}
          onChange={(e) => setFormData({ ...formData, inventoryQuantity: parseInt(e.target.value) })}
          className="mt-1 block w-full rounded-md border p-2"
          required
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm">
          Error: {error.message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create Product'}
      </button>
    </form>
  );
}
```

## Part 3: Real-Time Updates (Polling)

Apollo can automatically refetch data every few seconds to show real-time updates.

```typescript
export function useProductStats() {
  const { data, loading, error } = useQuery(GET_PRODUCT_STATS, {
    client: productClient,
    variables: { shopDomain: SHOP_DOMAIN },
    pollInterval: 5000, // Refetch every 5 seconds! ✨
  });

  return { stats: data?.productStats, loading, error };
}
```

## Quick Reference

### Reading Data
```typescript
const { data, loading, error } = useQuery(MY_QUERY, {
  client: productClient,
  variables: { someVar: 'value' },
  pollInterval: 5000, // Optional: auto-refresh
});
```

### Writing Data
```typescript
const [mutate, { loading, error }] = useMutation(MY_MUTATION, {
  client: productClient,
  refetchQueries: [{ query: MY_QUERY }], // Refresh data after mutation
});

await mutate({ variables: { input: data } });
```

### Multiple Clients
We have 4 clients for 4 different backends:
- `productClient` - for product operations
- `orderClient` - for order operations
- `customerClient` - for customer operations
- `eventClient` - for webhook events

Just pass the right client to `useQuery` or `useMutation`!

## Common Patterns

### Loading State
```typescript
if (loading) return <Spinner />;
```

### Error State
```typescript
if (error) return <div>Error: {error.message}</div>;
```

### No Data
```typescript
if (!data || data.products.length === 0) {
  return <div>No products found</div>;
}
```

### Full Pattern
```typescript
function MyComponent() {
  const { data, loading, error } = useQuery(MY_QUERY);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No data</div>;

  return <div>{/* Render data */}</div>;
}
```

## Next Steps

1. Start with reading data (queries) - it's easier
2. Add mutations once you're comfortable with queries
3. Use the GraphQL Playground in your browser to test queries first:
   - Visit: https://xq2jlkzzc1.execute-api.us-east-1.amazonaws.com/graphql
   - Try running queries to see what data looks like
4. Copy the queries that work into your React app

## Testing Your Queries

Before writing React components, test your queries in GraphQL Playground:

1. Open: https://xq2jlkzzc1.execute-api.us-east-1.amazonaws.com/graphql
2. Try this query:

```graphql
query {
  productStats(shopDomain: "don-stefani-demo-store.myshopify.com") {
    total
    byStatus {
      active
      draft
      archived
    }
  }
}
```

3. Once it works there, copy it to your React app!

## Need Help?

- **GraphQL Playground**: Test queries in your browser first
- **Apollo DevTools**: Chrome extension to debug Apollo Client
- **Console.log**: Log `data`, `loading`, `error` to see what's happening

