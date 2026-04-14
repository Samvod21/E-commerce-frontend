import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './app/pages/Home';
import ProductDetail from './app/pages/ProductDetails';
import Cart from './app/pages/Cart';
import Checkout from './app/pages/Checkout';
import Orders from './app/pages/OrderHistory';
import '../src/app/styles/app.css'; // Import your custom CSS

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/cart">Cart</Link>
        <Link to="/orders">Order History</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
    </Router>
  );
}

export default App;