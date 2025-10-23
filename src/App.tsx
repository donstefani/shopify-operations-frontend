import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { productClient } from './lib/apollo-client';
import { AppRoutes } from './router';

function App() {
  return (
    <ApolloProvider client={productClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;

