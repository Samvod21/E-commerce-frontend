import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import '../styles/app.css'; // Import your custom CSS

const ProductDetail = () => {
  const { id } = useParams();
  const { products, addToCart } = useContext(CartContext);
  const product = products.find(p => p.id === parseInt(id));

  if (!product) return <div className="container">Product not found.</div>;

  return (
    <div className="container">
      <div className="detail-container">
        <img src={product.image} alt={product.name} style={{ width: '400px' }} />
        <div className="detail-info">
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <p><strong>Price:</strong> ${product.price}</p>
          <p><strong>Stock:</strong> {product.stock > 0 ? 'In Stock' : 'Out of Stock'}</p>
          <button onClick={() => addToCart(product)}>Add to Cart</button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;