import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Package, Calendar, DollarSign, Loader2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api/products', '')
  : 'http://localhost:5000';

export const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setOrders([]);
          return;
        }

        const res = await fetch(`${API_BASE}/api/orders`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();
        if (res.ok && data.success) {
          const normalised = (data.orders || []).map((o) => ({
            id: o._id ?? o.id,
            date: o.createdAt ?? o.date,
            total: o.total,
            delivered: o.status === 'delivered',
            items: (o.items || []).map((it) => ({
              id: it.product ?? it._id,
              name: it.name,
              price: it.price,
              quantity: it.quantity,
              image: it.image
            })),
            customerInfo: o.customerInfo
          }));

          normalised.sort((a, b) => new Date(b.date) - new Date(a.date));
          setOrders(normalised);
        } else {
          setOrders([]);
        }
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const hasOrders = useMemo(() => orders.length > 0, [orders]);


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

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!hasOrders) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-900 sm:mb-8">Order History</h1>
        <div className="rounded-lg bg-white py-12 text-center shadow-md">
          <Package className="mx-auto mb-4 h-20 w-20 text-gray-300 sm:h-24 sm:w-24" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">No orders yet</h2>
          <p className="mb-6 text-gray-600">Start shopping to see your order history!</p>
          <Link
            to="/"
            className="inline-block rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="mb-5 text-3xl font-bold text-gray-900 sm:mb-8">Order History</h1>

      <div className="space-y-5 sm:space-y-6">
        {orders.map(order => (
          <div key={order.id} className="overflow-hidden rounded-lg bg-white shadow-md">
            <div className="border-b bg-gray-50 px-4 py-4 sm:px-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex items-start gap-2">
                  <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-gray-600" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="font-semibold text-gray-900">{formatDate(order.date)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="mt-0.5 h-5 w-5 shrink-0 text-gray-600" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-semibold text-blue-600">${order.total.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Package className="mt-0.5 h-5 w-5 shrink-0 text-gray-600" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="break-all font-semibold text-gray-900">#{order.id}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 py-4 sm:px-6">
              <h3 className="mb-4 font-semibold text-gray-900">Items Ordered</h3>
              <div className="space-y-3">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-start gap-3 sm:items-center sm:gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-16 w-16 shrink-0 rounded object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/product/${item.id}`}
                        className="block truncate font-semibold text-gray-900 hover:text-blue-600"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity} x ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="shrink-0 font-semibold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t bg-gray-50 px-4 py-4 sm:px-6">
              <h3 className="mb-2 font-semibold text-gray-900">Shipping Information</h3>
              <div className="wrap-break-word text-sm text-gray-700">
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
