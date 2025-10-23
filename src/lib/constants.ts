export const SHOP_DOMAIN = import.meta.env.VITE_SHOP_DOMAIN || 'don-stefani-demo-store.myshopify.com';

export const API_URLS = {
  PRODUCT: import.meta.env.VITE_PRODUCT_API_URL || 'http://localhost:3000/graphql',
  ORDER: import.meta.env.VITE_ORDER_API_URL || 'http://localhost:3001/graphql',
  CUSTOMER: import.meta.env.VITE_CUSTOMER_API_URL || 'http://localhost:3002/graphql',
  EVENT: import.meta.env.VITE_EVENT_API_URL || 'http://localhost:3003/graphql',
};

