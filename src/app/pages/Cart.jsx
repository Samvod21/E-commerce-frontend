import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { cart, setCart } = useContext(CartContext);

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    ));
  };

  const removeItem = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <div className="container">
      <h2>Your Shopping Cart</h2>
      {cart.length === 0 ? <p>Your cart is empty.</p> : (
        <>
          {cart.map(item => (
            <div key={item.id} className="list-item">
              <div>
                <h4>{item.name}</h4>
                <p>${item.price} x {item.qty}</p>
              </div>
              <div>
                <button onClick={() => updateQty(item.id, -1)}>-</button>
                <span style={{ margin: '0 10px' }}>{item.qty}</span>
                <button onClick={() => updateQty(item.id, 1)}>+</button>
                <button onClick={() => removeItem(item.id)} style={{ marginLeft: '20px', background: 'red' }}>Remove</button>
              </div>
            </div>
          ))}
          <div className="total-price">Total: ${total.toFixed(2)}</div>
          <Link to="/checkout"><button style={{ width: '100%', marginTop: '20px', padding: '15px' }}>Proceed to Checkout</button></Link>
        </>
      )}
    </div>
  );
};

export default Cart;