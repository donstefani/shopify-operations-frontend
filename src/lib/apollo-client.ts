import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { API_URLS } from './constants';

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// Product client
const productLink = createHttpLink({
  uri: API_URLS.PRODUCT,
  headers: {
    'Apollo-Require-Preflight': 'true',
  },
});

export const productClient = new ApolloClient({
  link: from([errorLink, productLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});

// Order client
const orderLink = createHttpLink({
  uri: API_URLS.ORDER,
  headers: {
    'Apollo-Require-Preflight': 'true',
  },
});

export const orderClient = new ApolloClient({
  link: from([errorLink, orderLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});

// Customer client
const customerLink = createHttpLink({
  uri: API_URLS.CUSTOMER,
  headers: {
    'Apollo-Require-Preflight': 'true',
  },
});

export const customerClient = new ApolloClient({
  link: from([errorLink, customerLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});

// Event client
const eventLink = createHttpLink({
  uri: API_URLS.EVENT,
  headers: {
    'Apollo-Require-Preflight': 'true',
  },
});

export const eventClient = new ApolloClient({
  link: from([errorLink, eventLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});

