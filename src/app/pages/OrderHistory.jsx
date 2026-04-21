import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Package, Calendar, DollarSign } from 'lucide-react';

export const OrderHistory = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    // Sort by date, newest first
    savedOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
    setOrders(savedOrders);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Order History</h1>
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-600 mb-6">Start shopping to see your order history!</p>
          <Link
            to="/"
            className="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Order History</h1>

      <div className="space-y-6">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Order Header */}
            <div className="bg-gray-50 px-6 py-4 border-b">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="font-semibold text-gray-900">{formatDate(order.date)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-semibold text-blue-600">${order.total.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="font-semibold text-gray-900">#{order.id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="px-6 py-4">
              <h3 className="font-semibold text-gray-900 mb-4">Items Ordered</h3>
              <div className="space-y-3">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <Link
                        to={`/product/${item.id}`}
                        className="font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-gray-50 px-6 py-4 border-t">
              <h3 className="font-semibold text-gray-900 mb-2">Shipping Information</h3>
              <div className="text-sm text-gray-700">
                <p><span className="font-medium">Name:</span> {order.customerInfo.name}</p>
                <p><span className="font-medium">Email:</span> {order.customerInfo.email}</p>
                <p><span className="font-medium">Address:</span> {order.customerInfo.address}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
