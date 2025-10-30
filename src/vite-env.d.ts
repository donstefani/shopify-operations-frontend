/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PRODUCT_API_URL: string
  readonly VITE_ORDER_API_URL: string
  readonly VITE_CUSTOMER_API_URL: string
  readonly VITE_EVENT_API_URL: string
  readonly VITE_SHOP_DOMAIN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

