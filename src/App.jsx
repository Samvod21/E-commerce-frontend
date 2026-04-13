import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductDetails from './pages/ProductDetails';
import Navbar from './context/Navbar';
import Home from './pages/Home';
import Cart from './pages/Cart';
import OrderHistory from './pages/OrderHistory';
import { CartProvider } from './context/CartContext';
import Checkout from './pages/Checkout';

function App() {
  return (
    <CartProvider>
      <Router>
        <Navbar />
        
        <main className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/product/:id" element={<ProductDetails />} />

            <Route path="/cart" element={<Cart />} />

            <Route path="/checkout" element={<Checkout />} />

            <Route path="/orders" element={<OrderHistory />} />
          </Routes>
        </main>
      </Router>
    </CartProvider>
  );
}
export default App
