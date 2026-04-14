import React from 'react';

const Orders = () => {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];

  return (
    <div className="container">
      <h2>Order History</h2>
      {orders.length === 0 ? <p>No past orders found.</p> : (
        orders.map(order => (
          <div key={order.id} className="list-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
              <span>Order Date: {order.date}</span>
              <span>Total: ${order.total.toFixed(2)}</span>
            </div>
            <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
              Items: {order.items.map(i => `${i.name} (x${i.qty})`).join(', ')}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;