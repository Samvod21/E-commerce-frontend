import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import '../styles/global.css';

const Navbar = () => {
  const { cart } = useContext(CartContext);
  const itemCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <nav>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <Link to="/" style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>E-Shop</Link>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/">Products</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/cart">
            Cart <strong>({itemCount})</strong>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;