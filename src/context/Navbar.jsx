import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { cart } = useCart();
  const itemCount = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <nav className="bg-slate-900 text-white p-4 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold tracking-tight">E-Shop</Link>
        <div className="space-x-6 flex items-center">
          <Link to="/" className="hover:text-blue-400 transition">Products</Link>
          <Link to="/orders" className="hover:text-blue-400 transition">Orders</Link>
          <Link to="/cart" className="relative p-2 bg-blue-600 rounded-lg hover:bg-blue-700">
            Cart 🛒
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;