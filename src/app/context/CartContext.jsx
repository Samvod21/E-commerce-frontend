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

const getCartStorageKey = () => {
  if (typeof window === 'undefined') return 'guest-cart';
  const token = window.localStorage.getItem('token');
  if (!token) return 'guest-cart';

  try {
    const storedUser = window.localStorage.getItem('user');
    if (!storedUser) return 'cart:authenticated';
    const parsedUser = JSON.parse(storedUser);
    const userId = parsedUser._id || parsedUser.id;
    return userId ? `cart:${userId}` : 'cart:authenticated';
  } catch (err) {
    console.warn('Could not read user for cart storage:', err);
    return 'cart:authenticated';
  }
};

const readCartFromStorage = (storageKey) => {
  if (typeof window === 'undefined') return [];
  try {
    const savedCart = window.localStorage.getItem(storageKey);
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (err) {
    console.warn('Could not load saved cart:', err);
    return [];
  }
};

const persistCartToStorage = (storageKey, nextCart) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(nextCart));
  } catch (err) {
    console.warn('Could not save cart:', err);
  }
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [storageKey, setStorageKey] = useState(() => getCartStorageKey());
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

  useEffect(() => {
    setStorageKey(getCartStorageKey());
  }, [isAuthenticated]);

  useEffect(() => {
    const nextCart = readCartFromStorage(storageKey);
    setCart(nextCart);
  }, [storageKey]);

  useEffect(() => {
    persistCartToStorage(storageKey, cart);
  }, [cart, storageKey]);

  // ─── Load cart from server (called after login / on mount if authenticated) ─

  const syncCartWithServer = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE}/api/cart`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        if (data.cart?.items?.length) {
          setCart(data.cart.items.map(normaliseServerItem));
          return;
        }

        const guestCart = readCartFromStorage('guest-cart');
        if (Array.isArray(guestCart) && guestCart.length > 0) {
          for (const item of guestCart) {
            await fetch(`${API_BASE}/api/cart/add`, {
              method: 'POST',
              headers: authHeaders(),
              body: JSON.stringify({
                productId: item.id || item._id,
                quantity: item.quantity,
                size: item.size || 'Standard',
              }),
            });
          }
          window.localStorage.removeItem('guest-cart');

          const refreshedRes = await fetch(`${API_BASE}/api/cart`, {
            headers: authHeaders(),
          });
          const refreshedData = await refreshedRes.json();
          if (refreshedData.success && refreshedData.cart?.items?.length) {
            setCart(refreshedData.cart.items.map(normaliseServerItem));
            return;
          }
        }

        setCart([]);
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

  // NOTE: `size` and `unitPrice` are new params. When a product has multiple
  // sizes, each size can have its own price, so the caller (ProductDetails /
  // ProductCard) tells us which size was selected and what that size's price
  // is. We key cart matching on id+size so the same product in two different
  // sizes shows as two separate lines with two separate prices.
  const addToCart = useCallback(
    async (product, size, unitPrice) => {
      const resolvedSize = size || 'Standard';
      const resolvedPrice = typeof unitPrice === 'number' ? unitPrice : product.price;

      // Optimistically update local state first so the UI feels instant
      setCart((prev) => {
        const existing = prev.find((i) => i.id === product.id && i.size === resolvedSize);
        if (existing) {
          return prev.map((i) =>
            i.id === product.id && i.size === resolvedSize
              ? { ...i, quantity: i.quantity + 1 }
              : i
          );
        }
        return [...prev, { ...product, price: resolvedPrice, size: resolvedSize, quantity: 1 }];
      });

      // Then persist to the server if authenticated
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE}/api/cart/add`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            productId: product.id || product._id,
            quantity: 1,
            size: resolvedSize,
          }),
        });
        const data = await res.json();
        if (data.success && data.cart?.items) {
          // Keep server as source of truth after the call. The backend looks
          // up the correct price for `size` itself, so this also protects
          // against a stale/tampered price coming from the client.
          setCart(data.cart.items.map(normaliseServerItem));
        }
      } catch (err) {
        console.warn('Could not add item to server cart:', err);
      }
    },
    []
  );

  // ─── Remove from cart ────────────────────────────────────────────────────────

  const removeFromCart = useCallback(async (productId, size = 'Standard') => {
    setCart((prev) => prev.filter((i) => !(i.id === productId && i.size === size)));

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch(`${API_BASE}/api/cart/remove/${productId}?size=${encodeURIComponent(size)}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
    } catch (err) {
      console.warn('Could not remove item from server cart:', err);
    }
  }, []);

  // ─── Update quantity ─────────────────────────────────────────────────────────

  const updateQuantity = useCallback(async (productId, newQuantity, size = 'Standard') => {
    if (newQuantity <= 0) {
      removeFromCart(productId, size);
      return;
    }

    setCart((prev) =>
      prev.map((i) =>
        i.id === productId && i.size === size ? { ...i, quantity: newQuantity } : i
      )
    );

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch(`${API_BASE}/api/cart/update/${productId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ quantity: newQuantity, size }),
      });
    } catch (err) {
      console.warn('Could not update cart quantity on server:', err);
    }
  }, [removeFromCart]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  }, []);

  // ─── Clear cart ──────────────────────────────────────────────────────────────

  const clearCart = useCallback(async () => {
    setCart([]);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(storageKey);
    }

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
