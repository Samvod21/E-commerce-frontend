import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(savedOrders.reverse());
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.items.some(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const averageOrderValue = orders.length > 0 ? totalSpent / orders.length : 0;

  return (
    <div className="container mx-auto p-8 max-w-5xl">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 mb-2">Purchase History</h1>
        <p className="text-slate-500">Track your recent orders and purchases</p>
        
        {/* Stats Cards */}
        {orders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
              <p className="text-blue-100 text-sm mb-1">Total Orders</p>
              <p className="text-3xl font-black">{orders.length}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
              <p className="text-purple-100 text-sm mb-1">Total Spent</p>
              <p className="text-3xl font-black">${totalSpent.toFixed(2)}</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
              <p className="text-green-100 text-sm mb-1">Average Order</p>
              <p className="text-3xl font-black">${averageOrderValue.toFixed(2)}</p>
            </div>
          </div>
        )}
      </header>

      {orders.length > 0 && (
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search orders by product or order number..."
              className="w-full p-3 pl-10 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <div className="bg-slate-100 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
          <span className="text-5xl mb-4 block">📦</span>
          <h2 className="text-xl font-bold text-slate-400 mb-4">
            {orders.length === 0 ? 'No orders yet' : 'No orders match your search'}
          </h2>
          {orders.length === 0 && (
            <Link 
              to="/" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
            >
              Start Shopping
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order, index) => (
            <div 
              key={order.id} 
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all"
              style={{ animation: `slideIn 0.3s ease-out ${index * 0.1}s both` }}
            >
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className={`transform transition-transform ${expandedOrder === order.id ? 'rotate-90' : ''}`}>
                      ▶
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase tracking-wider">
                          Order #{order.orderNumber || order.id.toString().slice(-8)}
                        </span>
                        <span className="text-xs text-gray-400">{order.date}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'} • 
                        {order.shippingAddress && ` Ship to: ${order.shippingAddress.split(',')[0]}`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-slate-900">${order.total.toFixed(2)}</p>
                    <button className="text-blue-600 text-sm hover:underline mt-1">
                      {expandedOrder === order.id ? 'Show less' : 'View details'}
                    </button>
                  </div>
                </div>
              </div>

              {expandedOrder === order.id && (
                <div className="border-t bg-gray-50 p-6 animate-in slide-in-from-top duration-300">
                  <div className="space-y-3">
                    <h4 className="font-bold text-slate-700 mb-3">Order Items</h4>
                    {order.items.map(item => (
                      <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <span className="text-slate-700 font-medium">{item.name}</span>
                            <div className="text-xs text-gray-500">
                              ${item.price} each • {item.qty} {item.qty === 1 ? 'unit' : 'units'}
                            </div>
                          </div>
                        </div>
                        <span className="font-bold text-slate-900">${(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    ))}
                    
                    {order.shippingAddress && (
                      <div className="mt-4 p-4 bg-white rounded-xl">
                        <h4 className="font-bold text-slate-700 mb-2">Shipping Address</h4>
                        <p className="text-gray-600 text-sm">{order.shippingAddress}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                      <button 
                        onClick={() => {
                          // Create reorder functionality
                          const cartItems = order.items.map(item => ({
                            ...item,
                            qty: 1
                          }));
                          localStorage.setItem('reorder_items', JSON.stringify(cartItems));
                          window.location.href = '/cart';
                        }}
                        className="text-blue-600 hover:underline text-sm font-medium"
                      >
                        Buy Again
                      </button>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="text-xl font-black text-slate-900">${order.total.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default OrderHistory;