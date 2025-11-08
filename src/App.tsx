import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './router';
import { NotificationContainer } from './components/notifications/NotificationContainer';

function App() {
  return (
    <BrowserRouter basename="/portfolio/shopify-operations/">
      <AppRoutes />
      <NotificationContainer />
    </BrowserRouter>
  );
}

export default App;

