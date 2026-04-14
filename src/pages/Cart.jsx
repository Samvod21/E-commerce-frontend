import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const Cart = () => {
  const { cart, updateQty, removeFromCart, total } = useCart();
  const [removingId, setRemovingId] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleRemove = (id) => {
    setRemovingId(id);
    setTimeout(() => {
      removeFromCart(id);
      setRemovingId(null);
    }, 300);
  };

  if (cart.length === 0) return (
    <div className="text-center py-20">
      <div className="animate-bounce mb-4 text-6xl">🛒</div>
      <h2 className="text-2xl font-bold text-gray-400 mb-4">Your cart is empty</h2>
      <Link to="/" className="text-blue-600 mt-4 inline-block hover:underline text-lg">
        Start Shopping →
      </Link>
    </div>
  );

  const shipping = total > 100 ? 0 : 10;
  const tax = total * 0.1;

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          Shopping Cart 
          <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {cart.reduce((acc, item) => acc + item.qty, 0)} items
          </span>
        </h1>
        <button 
          onClick={() => setShowClearConfirm(true)}
          className="text-red-500 hover:text-red-700 text-sm underline"
        >
          Clear Cart
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="space-y-2">
          {cart.map(item => (
            <div 
              key={item.id} 
              className={`flex items-center justify-between border-b py-4 last:border-0 transition-all duration-300 ${
                removingId === item.id ? 'opacity-0 translate-x-4' : 'opacity-100'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-gray-500 text-sm">${item.price} each</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <button 
                    onClick={() => updateQty(item.id, -1)} 
                    className="px-3 py-1 hover:bg-gray-100 transition-colors font-bold"
                    disabled={item.qty === 1}
                  >
                    −
                  </button>
                  <span className="px-4 py-1 font-medium border-x bg-gray-50 min-w-[3rem] text-center">
                    {item.qty}
                  </span>
                  <button 
                    onClick={() => updateQty(item.id, 1)} 
                    className="px-3 py-1 hover:bg-gray-100 transition-colors font-bold"
                  >
                    +
                  </button>
                </div>
                <div className="text-right min-w-[4rem]">
                  <p className="font-bold">${(item.price * item.qty).toFixed(2)}</p>
                </div>
                <button 
                  onClick={() => handleRemove(item.id)} 
                  className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove item"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 pt-6 border-t">
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className="flex items-center gap-2">
                {shipping === 0 ? (
                  <span className="text-green-600 text-sm">FREE</span>
                ) : (
                  `$${shipping.toFixed(2)}`
                )}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t">
              <span>Total</span>
              <span>${(total + shipping + tax).toFixed(2)}</span>
            </div>
            {total > 0 && total < 100 && (
              <p className="text-sm text-blue-600 mt-2">
                Add ${(100 - total).toFixed(2)} more for free shipping!
              </p>
            )}
          </div>

          <div className="flex justify-between items-center">
            <Link 
              to="/" 
              className="text-blue-600 hover:underline flex items-center gap-2"
            >
              ← Continue Shopping
            </Link>
            <Link 
              to="/checkout" 
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition transform hover:scale-105"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>

      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold mb-4">Clear Cart?</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to remove all items from your cart?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  cart.forEach(item => removeFromCart(item.id));
                  setShowClearConfirm(false);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;