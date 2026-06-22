import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import { ShoppingCart, Home, History, LogOut, User, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const Navbar = () => {
  const navigate = useNavigate();
  const { getCartCount, isAuthenticated, logout } = useCart();
  const cartCount = getCartCount();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  const closeMenu = () => setIsOpen(false);

  const navLinkClass = 'flex items-center gap-2 rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-blue-50 hover:text-blue-600';

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" onClick={closeMenu} className="flex items-center space-x-2">
            <Home className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-xl text-gray-900">E-Shop</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen((current) => !current)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100 md:hidden"
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>

          <div className="hidden items-center space-x-2 md:flex">
            {(() => {
              let user = null;
              try {
                const raw = localStorage.getItem('user');
                user = raw ? JSON.parse(raw) : null;
              } catch {
                user = null;
              }
              const firstName = user?.firstName || user?.name?.split?.(' ')?.[0];
              const lastName = user?.lastName || user?.name?.split?.(' ')?.[1];
              const greetingName = [firstName, lastName].filter(Boolean).join(' ');

              return greetingName ? (
                <span className="mr-2 text-sm text-gray-600">Hello, {greetingName}</span>
              ) : null;
            })()}

            <Link
              to="/dashboard"
              className={navLinkClass}
            >
              <span>Dashboard</span>
            </Link>

            <Link
              to="/orders"
              className={navLinkClass}
            >
              <History className="h-5 w-5" />
              <span>Orders</span>
            </Link>


            <Link
              to="/cart"
              className={`${navLinkClass} relative`}
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 min-w-5 px-1 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            ) : (
              <Link
                to="/login"
                className={navLinkClass}
              >
                <User className="h-5 w-5" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>

        {isOpen && (
          <div className="border-t border-gray-100 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              <Link to="/dashboard" onClick={closeMenu} className={navLinkClass}>
                <span>Dashboard</span>
              </Link>
              <Link to="/orders" onClick={closeMenu} className={navLinkClass}>
                <History className="h-5 w-5" />
                <span>Orders</span>
              </Link>
              <Link to="/cart" onClick={closeMenu} className={`${navLinkClass} justify-between`}>
                <span className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Cart
                </span>
                {cartCount > 0 && (
                  <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-gray-700 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              ) : (
                <Link to="/login" onClick={closeMenu} className={navLinkClass}>
                  <User className="h-5 w-5" />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
