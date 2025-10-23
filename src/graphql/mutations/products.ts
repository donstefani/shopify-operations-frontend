/**
 * Mutation to create a new product
 * Product will be created in DynamoDB first, then synced to Shopify
 */
export const CREATE_PRODUCT = `
  mutation CreateProduct($shopDomain: String!, $input: CreateProductInput!) {
    createProduct(shopDomain: $shopDomain, input: $input) {
      id
      shopifyId
      title
      status
      syncStatus
      createdAt
    }
  }
`;

/**
 * Mutation to update an existing product
 */
export const UPDATE_PRODUCT = `
  mutation UpdateProduct($shopDomain: String!, $shopifyId: String!, $input: UpdateProductInput!) {
    updateProduct(shopDomain: $shopDomain, shopifyId: $shopifyId, input: $input) {
      id
      shopifyId
      title
      status
      syncStatus
      updatedAt
    }
  }
`;

/**
 * Mutation to delete a product
 * Removes from both DynamoDB and Shopify
 */
export const DELETE_PRODUCT = `
  mutation DeleteProduct($shopDomain: String!, $shopifyId: String!) {
    deleteProduct(shopDomain: $shopDomain, shopifyId: $shopifyId)
  }
`;

/**
 * Mutation to sync all products from Shopify to database
 * This is used for initial import or full resync
 */
export const SYNC_ALL_PRODUCTS = `
  mutation SyncAllProducts($shopDomain: String!) {
    syncAllProducts(shopDomain: $shopDomain) {
      success
      message
      imported
      updated
      errors
      details {
        action
        shopifyId
        title
        error
      }
    }
  }
`;

