import { createBrowserRouter } from 'react-router';
import { Home } from './app/pages/Home';
import { ProductDetails } from './app/pages/ProductDetails';
import { Cart } from './app/pages/Cart';
import { Checkout } from './app/pages/Checkout';
import { OrderHistory } from './app/pages/OrderHistory';
import { Navbar } from './app/components/Navbar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
    </div>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><Home /></Layout>
  },
  {
    path: '/product/:id',
    element: <Layout><ProductDetails /></Layout>
  },
  {
    path: '/cart',
    element: <Layout><Cart /></Layout>
  },
  {
    path: '/checkout',
    element: <Layout><Checkout /></Layout>
  },
  {
    path: '/orders',
    element: <Layout><OrderHistory /></Layout>
  },
  {
    path: '*',
    element: (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404 - Page Not Found</h1>
            <a href="/" className="text-blue-600 hover:underline">Return to Home</a>
          </div>
        </div>
      </Layout>
    )
  }
]);
