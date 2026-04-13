import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { cart, updateQty, removeFromCart, total } = useCart();

  if (cart.length === 0) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-gray-400">Your cart is empty</h2>
      <Link to="/" className="text-blue-600 mt-4 inline-block hover:underline">Go Shopping</Link>
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <div className="bg-white rounded-xl shadow-sm border p-4">
        {cart.map(item => (
          <div key={item.id} className="flex items-center justify-between border-b py-4 last:border-0">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded"></div>
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-gray-500 text-sm">${item.price}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded-lg">
                <button onClick={() => updateQty(item.id, -1)} className="px-3 py-1 hover:bg-gray-100">-</button>
                <span className="px-3 py-1 font-medium border-x">{item.qty}</span>
                <button onClick={() => updateQty(item.id, 1)} className="px-3 py-1 hover:bg-gray-100">+</button>
              </div>
              <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">Remove</button>
            </div>
          </div>
        ))}
        
        <div className="mt-8 pt-6 border-t flex justify-between items-center">
          <div>
            <p className="text-gray-500">Total Amount</p>
            <h2 className="text-3xl font-bold text-slate-900">${total.toFixed(2)}</h2>
          </div>
          <Link to="/checkout" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;