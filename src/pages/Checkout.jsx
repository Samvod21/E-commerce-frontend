import { useState } from 'react';
import { useCart } from '../context/CartContext';

const Checkout = () => {
  const { cart, total, clearCart } = useCart();
  const [formData, setFormData] = useState({ name: '', email: '', address: '' });
  const [ordered, setOrdered] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newOrder = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      items: cart,
      total: total
    };

    const pastOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    localStorage.setItem('orders', JSON.stringify([...pastOrders, newOrder]));
    
    clearCart();
    setOrdered(true);
  };

  if (ordered) return <h2>Order Confirmed! Thank you for your purchase.</h2>;

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Name" required value={formData.name} 
        onChange={e => setFormData({...formData, name: e.target.value})} />
      <input type="email" placeholder="Email" required value={formData.email} 
        onChange={e => setFormData({...formData, email: e.target.value})} />
      <textarea placeholder="Address" required value={formData.address} 
        onChange={e => setFormData({...formData, address: e.target.value})} />
      
      <h3>Total: ${total.toFixed(2)}</h3>
      <button type="submit" disabled={cart.length === 0}>Place Order</button>
    </form>
  );
};