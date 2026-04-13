import { useEffect, useState } from 'react';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(savedOrders);
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Your Order History</h1>
      {orders.length === 0 ? (
        <p className="text-gray-500">No past orders found.</p>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white border rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4 border-b pb-4">
                <div>
                  <p className="text-sm text-gray-500">Ordered on</p>
                  <p className="font-bold">{order.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-bold text-blue-600">${order.total.toFixed(2)}</p>
                </div>
              </div>
              <div className="space-y-2">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} (x{item.qty})</span>
                    <span className="text-gray-600">${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;