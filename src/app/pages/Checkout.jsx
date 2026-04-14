import React, { useState, useContext } from 'react';
import { CartContext } from '../context/CartContext';
import '../styles/global.css'; // Import global styles

const Checkout = () => {
  const { cart, setCart } = useContext(CartContext);
  const [form, setForm] = useState({ name: '', email: '', address: '' });
  const [submitted, setSubmitted] = useState(false);

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const order = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      items: cart,
      total: total
    };
    
    // Save to localStorage [cite: 36]
    const history = JSON.parse(localStorage.getItem('orders')) || [];
    localStorage.setItem('orders', JSON.stringify([order, ...history]));
    
    setCart([]); // Clear cart [cite: 36]
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2 style={{ color: 'green' }}>Order Confirmed!</h2>
        <p>Your order has been saved to your history.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <h2>Checkout</h2>
      
      {/* Order Summary [cite: 35] */}
      <div style={{ marginBottom: '30px', borderBottom: '1px solid #ddd', paddingBottom: '20px' }}>
        <h3>Order Summary</h3>
        {cart.map(item => (
          <div key={item.id} className="list-item" style={{ padding: '10px 0', borderBottom: 'none' }}>
            <span>{item.name} (x{item.qty})</span>
            <span>${(item.price * item.qty).toFixed(2)}</span>
          </div>
        ))}
        <div className="total-price">Total: ${total.toFixed(2)}</div>
      </div>
      
      {/* Simulation Form [cite: 33, 34] */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          required 
          style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc' }} 
          placeholder="Full Name" 
          onChange={e => setForm({...form, name: e.target.value})} 
        />
        <input 
          required 
          type="email" 
          style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc' }} 
          placeholder="Email Address" 
          onChange={e => setForm({...form, email: e.target.value})} 
        />
        <textarea 
          required 
          style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }} 
          placeholder="Shipping Address" 
          onChange={e => setForm({...form, address: e.target.value})} 
        />
        <button type="submit" style={{ padding: '15px', fontSize: '1rem', fontWeight: 'bold' }}>
          Place Order
        </button>
      </form>
    </div>
  );
};

export default Checkout;