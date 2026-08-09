import { Link } from 'react-router';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
        <div className="text-center py-12">
          <ShoppingBag className="mx-auto mb-4 h-20 w-20 text-gray-300 sm:h-24 sm:w-24" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to get started!</p>
          <Link
            to="/"
            className="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="mb-4 text-2xl font-bold text-gray-900 sm:mb-8 sm:text-3xl">Shopping Cart</h1>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.7fr_0.9fr] lg:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-lg bg-white shadow-md">
            {cart.map(item => (
              <div key={`${item.id}-${item.size || 'Standard'}`} className="border-b last:border-b-0">
                <div className="flex flex-col gap-4 p-3 sm:flex-row sm:items-center sm:p-4">
                  {/* Product Image */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-32 w-full rounded object-cover sm:h-24 sm:w-24"
                  />

                  {/* Product Details */}
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/product/${item.id}`}
                      className="block truncate text-lg font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-gray-600">{item.category}</p>
                    {item.size && item.size !== 'Standard' && (
                      <p className="text-sm text-gray-500">Size: {item.size}</p>
                    )}
                    <p className="text-lg font-bold text-blue-600 mt-1">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between gap-3 sm:justify-start">
                    <span className="text-sm font-medium text-gray-600 sm:hidden">Quantity</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1, item.size)}
                        className="p-1 rounded bg-gray-200 hover:bg-gray-300"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1, item.size)}
                        disabled={item.quantity >= item.stock}
                        className="p-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:block sm:text-right">
                    <span className="text-sm font-medium text-gray-600 sm:hidden">Item total</span>
                    <p className="text-lg font-bold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id, item.size)}
                    className="inline-flex items-center justify-center gap-2 rounded border border-red-100 px-3 py-2 text-red-600 transition-colors hover:bg-red-50 sm:border-0 sm:p-2"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span className="sm:hidden">Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-lg bg-white p-5 shadow-md lg:sticky lg:top-20 lg:p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">${getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold text-green-600">Free</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="text-lg font-bold">Total</span>
                <span className="text-lg font-bold text-blue-600">
                  ${getCartTotal().toFixed(2)}
                </span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="block w-full bg-blue-600 text-white text-center py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Proceed to Checkout
            </Link>

            <Link
              to="/"
              className="block w-full text-center text-blue-600 py-2 mt-3 hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
