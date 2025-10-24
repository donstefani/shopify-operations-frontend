import { GraphQLClient } from 'graphql-request';
import { API_URLS } from './constants';

// Create GraphQL clients for each service
export const productClient = new GraphQLClient(API_URLS.PRODUCT, {
  headers: {
    'Content-Type': 'application/json',
  },
});

export const orderClient = new GraphQLClient(API_URLS.ORDER, {
  headers: {
    'Content-Type': 'application/json',
  },
});

export const customerClient = new GraphQLClient(API_URLS.CUSTOMER, {
  headers: {
    'Content-Type': 'application/json',
  },
});

export const eventClient = new GraphQLClient(API_URLS.EVENT, {
  headers: {
    'Content-Type': 'application/json',
  },
});

// GraphQL queries
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

export const GET_ORDER_STATS = `
  query GetOrderStats($shopDomain: String!) {
    orderStats(shopDomain: $shopDomain) {
      total
      totalRevenue
      byStatus {
        pending
        paid
        fulfilled
        cancelled
      }
    }
  }
`;

export const GET_ORDERS = `
  query GetOrders($shopDomain: String!, $limit: Int) {
    orders(shopDomain: $shopDomain, limit: $limit) {
      items {
        id
        shopifyId
        orderNumber
        customerEmail
        totalPrice
        currency
        status
        fulfillmentStatus
        financialStatus
        createdAt
        updatedAt
      }
      totalCount
    }
  }
`;

export const GET_CUSTOMER_STATS = `
  query GetCustomerStats($shopDomain: String!) {
    customerStats(shopDomain: $shopDomain) {
      total
      byStatus {
        active
        disabled
      }
    }
  }
`;
