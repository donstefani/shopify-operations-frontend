# Shopify Operations Manager - Dashboard UI

React dashboard for managing Shopify products, orders, and customers with GraphQL backend services.

## Features

- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **Apollo Client** for GraphQL
- **React Router** for routing
- **React Hook Form** + Zod for forms

## Getting Started

### Install Dependencies

```bash
npm install
```

### Configure Environment

Update `.env.local` with your backend GraphQL endpoints:

```env
VITE_PRODUCT_API_URL=https://[your-api].execute-api.us-east-1.amazonaws.com/dev/graphql
VITE_ORDER_API_URL=https://[your-api].execute-api.us-east-1.amazonaws.com/dev/graphql
VITE_CUSTOMER_API_URL=https://[your-api].execute-api.us-east-1.amazonaws.com/dev/graphql
VITE_EVENT_API_URL=https://[your-api].execute-api.us-east-1.amazonaws.com/dev/graphql
VITE_SHOP_DOMAIN=don-stefani-demo-store.myshopify.com
```

### Development

```bash
npm run dev
```

Access the app at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   ├── layout/      # Layout components
│   ├── products/    # Product components
│   ├── orders/      # Order components
│   ├── customers/   # Customer components
│   └── dashboard/   # Dashboard components
├── graphql/         # GraphQL queries and mutations
├── hooks/           # Custom React hooks
├── lib/             # Utilities and config
├── pages/           # Page components
├── types/           # TypeScript types
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

## Tech Stack

- **React 18.3** - UI library
- **TypeScript 5.6** - Type safety
- **Vite 6.0** - Build tool
- **Tailwind CSS 3.4** - Styling
- **shadcn/ui** - Component library
- **Apollo Client 3.11** - GraphQL client
- **React Router 6.28** - Routing
- **React Hook Form 7.53** - Forms
- **Zod 3.23** - Schema validation

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Other Options

- **Netlify**: Similar to Vercel
- **AWS S3 + CloudFront**: For full AWS stack
- **Docker**: Containerized deployment

## Development Tips

- Use `npm run lint` to check for issues
- Components auto-import with `@/` alias
- GraphQL queries use Apollo Client hooks
- Forms use React Hook Form + Zod for validation

