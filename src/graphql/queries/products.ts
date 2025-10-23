/**
 * Query to get product statistics
 * This is the simplest query - great for testing!
 */
export const GET_PRODUCT_STATS = `
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

/**
 * Query to get a list of products with pagination
 */
export const GET_PRODUCTS = `
  query GetProducts($shopDomain: String!, $limit: Int, $cursor: String, $filters: ProductFilters) {
    products(shopDomain: $shopDomain, limit: $limit, cursor: $cursor, filters: $filters) {
      items {
        id
        shopifyId
        title
        handle
        vendor
        productType
        price
        inventoryQuantity
        status
        syncStatus
        createdAt
        updatedAt
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

/**
 * Query to get a single product by ID
 */
export const GET_PRODUCT = `
  query GetProduct($shopDomain: String!, $shopifyId: String!) {
    product(shopDomain: $shopDomain, shopifyId: $shopifyId) {
      id
      shopifyId
      title
      handle
      vendor
      productType
      tags
      price
      inventoryQuantity
      status
      syncStatus
      createdAt
      updatedAt
    }
  }
`;

