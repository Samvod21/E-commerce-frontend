import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p style={{ color: '#666' }}>{product.category}</p>
      <p><strong>${product.price}</strong></p>
      <p style={{ fontSize: '0.8rem', color: product.stock > 0 ? 'green' : 'red' }}>
        {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'} [cite: 13]
      </p>
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <Link to={`/product/${product.id}`}>
          <button style={{ background: '#6c757d' }}>Details</button>
        </Link>
        <button onClick={() => addToCart(product)} disabled={product.stock === 0}>
          Add to Cart [cite: 19]
        </button>
      </div>
    </div>
  );
};

export default ProductCard;