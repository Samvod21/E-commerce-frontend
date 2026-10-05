import { createBrowserRouter } from 'react-router-dom';
import { Home, ProductDetails, Cart, Checkout, OrderHistory, Dashboard, Login, Signup } from './app/lazyPages';
import { Layout } from './app/components/Layout';
import { RequireSeller } from './app/components/RequireSeller';

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
    path: '/dashboard',
    element: (
      <Layout>
        {/* Seller-only dashboard */}
        <RequireSeller>
          <Dashboard />
        </RequireSeller>
      </Layout>
    )
  },

  {
    path: '/orders',
    element: <Layout><OrderHistory /></Layout>
  },
  {
    path: '/login',
    element: <Layout><Login /></Layout>
  },
  {
    path: '/signup',
    element: <Layout><Signup /></Layout>
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
