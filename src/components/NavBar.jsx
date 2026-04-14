import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { cart } = useCart();
  const location = useLocation();
  const itemCount = cart.reduce((acc, item) => acc + item.qty, 0);

  const isActive = (path) => location.pathname === path ? "text-blue-500" : "text-slate-300 hover:text-white";

  return (
    <nav className="bg-slate-900/95 backdrop-blur-md text-white py-4 px-6 sticky top-0 z-50 border-b border-slate-800">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black group-hover:rotate-12 transition-transform">E</div>
          <span className="text-xl font-black tracking-tighter">TECH.STORE</span>
        </Link>
        
        <div className="flex items-center gap-8 font-bold text-sm">
          <Link to="/" className={`${isActive('/')} transition-colors uppercase tracking-widest`}>Products</Link>
          <Link to="/orders" className={`${isActive('/orders')} transition-colors uppercase tracking-widest`}>History</Link>
          
          <Link to="/cart" className="relative group bg-slate-800 p-2.5 rounded-xl border border-slate-700 hover:border-blue-500 transition-all">
            <span className="text-xl">🛒</span>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-[10px] h-5 w-5 flex items-center justify-center rounded-full border-2 border-slate-900 animate-bounce">
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