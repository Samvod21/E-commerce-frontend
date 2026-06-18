import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();

const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api/products', '')
  : 'http://localhost:5000';

// Helper: returns auth headers if a token exists
const authHeaders = () => {
  const token = localStorage.getItem('token');
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('token')
  );

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const getCartTotal = useCallback(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const getCartCount = useCallback(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  // Normalise a server cart item into the flat shape the UI expects
  const normaliseServerItem = (item) => ({
    id: item.productId?._id || item.productId,
    name: item.productId?.name || item.name,
    price: item.price,
    image: item.productId?.image || item.image,
    category: item.productId?.category || item.category,
    stock: item.productId?.stock ?? item.stock ?? 99,
    size: item.size || 'Standard',
    quantity: item.quantity,
  });

  // ─── Load cart from server (called after login / on mount if authenticated) ─

  const syncCartWithServer = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/cart`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success && data.cart?.items?.length) {
        setCart(data.cart.items.map(normaliseServerItem));
      }
    } catch (err) {
      console.warn('Could not sync cart with server:', err);
    }
  }, []);

  // On mount, restore auth state and sync cart
  useEffect(() => {
    if (isAuthenticated) syncCartWithServer();
  }, [isAuthenticated, syncCartWithServer]);

  // ─── Add to cart ─────────────────────────────────────────────────────────────

  const addToCart = useCallback(
    async (product) => {
      // Optimistically update local state first so the UI feels instant
      setCart((prev) => {
        const existing = prev.find((i) => i.id === product.id);
        if (existing) {
          return prev.map((i) =>
            i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        return [...prev, { ...product, quantity: 1 }];
      });

      // Then persist to the server if authenticated
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE}/api/cart/add`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ productId: product.id || product._id, quantity: 1 }),
        });
        const data = await res.json();
        if (data.success && data.cart?.items) {
          // Keep server as source of truth after the call
          setCart(data.cart.items.map(normaliseServerItem));
        }
      } catch (err) {
        console.warn('Could not add item to server cart:', err);
      }
    },
    []
  );

  // ─── Remove from cart ────────────────────────────────────────────────────────

  const removeFromCart = useCallback(async (productId) => {
    setCart((prev) => prev.filter((i) => i.id !== productId));

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch(`${API_BASE}/api/cart/remove/${productId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
    } catch (err) {
      console.warn('Could not remove item from server cart:', err);
    }
  }, []);

  // ─── Update quantity ─────────────────────────────────────────────────────────

  const updateQuantity = useCallback(async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prev) =>
      prev.map((i) => (i.id === productId ? { ...i, quantity: newQuantity } : i))
    );

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch(`${API_BASE}/api/cart/update/${productId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ quantity: newQuantity }),
      });
    } catch (err) {
      console.warn('Could not update cart quantity on server:', err);
    }
  }, [removeFromCart]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setCart([]);
  }, []);

  // ─── Clear cart ──────────────────────────────────────────────────────────────

  const clearCart = useCallback(async () => {
    setCart([]);

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch(`${API_BASE}/api/cart/clear`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
    } catch (err) {
      console.warn('Could not clear server cart:', err);
    }
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        isAuthenticated,
        setIsAuthenticated,
        addToCart,
        removeFromCart,
        updateQuantity,
        getCartTotal,
        getCartCount,
        clearCart,
        logout,
        syncCartWithServer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside a CartProvider');
  return context;
};
