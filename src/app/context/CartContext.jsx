import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();
const API_BASE_URL = 'http://localhost:5000/api';

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);

    if (token) {
      // Fetch cart from server if authenticated
      fetchCartFromServer();
    } else {
      // Load from localStorage if not authenticated
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes (for non-authenticated users)
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }, [cart, isAuthenticated]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchCartFromServer = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (data.success) {
        // Transform server cart to local format
        const transformedCart = data.cart.items.map(item => ({
          id: item.productId._id,
          ...item.productId,
          quantity: item.quantity,
          size: item.size
        }));
        setCart(transformedCart);
        setError(null);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = async (product) => {
    try {
      setLoading(true);
      setError(null);

      if (isAuthenticated) {
        // Add to server
        const response = await fetch(`${API_BASE_URL}/cart/add`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            productId: product.id || product._id,
            quantity: 1,
            size: product.size || 'Standard'
          })
        });

        const data = await response.json();

        if (data.success) {
          await fetchCartFromServer();
        } else {
          setError(data.message);
        }
      } else {
        // Add to local state
        setCart(prevCart => {
          const existingItem = prevCart.find(item => item.id === product.id);

          if (existingItem) {
            return prevCart.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          } else {
            return [...prevCart, { ...product, quantity: 1 }];
          }
        });
      }
    } catch (err) {
      setError(err.message);
      console.error('Error adding to cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId, size = 'Standard') => {
    try {
      setLoading(true);
      setError(null);

      if (isAuthenticated) {
        const response = await fetch(`${API_BASE_URL}/cart/remove/${productId}?size=${size}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });

        const data = await response.json();

        if (data.success) {
          await fetchCartFromServer();
        } else {
          setError(data.message);
        }
      } else {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
      }
    } catch (err) {
      setError(err.message);
      console.error('Error removing from cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity, size = 'Standard') => {
    try {
      setLoading(true);
      setError(null);

      if (quantity <= 0) {
        await removeFromCart(productId, size);
        return;
      }

      if (isAuthenticated) {
        const response = await fetch(`${API_BASE_URL}/cart/update/${productId}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            quantity,
            size
          })
        });

        const data = await response.json();

        if (data.success) {
          await fetchCartFromServer();
        } else {
          setError(data.message);
        }
      } else {
        setCart(prevCart =>
          prevCart.map(item =>
            item.id === productId
              ? { ...item, quantity }
              : item
          )
        );
      }
    } catch (err) {
      setError(err.message);
      console.error('Error updating quantity:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isAuthenticated) {
        const response = await fetch(`${API_BASE_URL}/cart/clear`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });

        const data = await response.json();

        if (data.success) {
          setCart([]);
        } else {
          setError(data.message);
        }
      } else {
        setCart([]);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error clearing cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const syncCartWithServer = async () => {
    if (isAuthenticated) {
      // When user logs in, sync local cart with server
      if (cart.length > 0) {
        for (const item of cart) {
          try {
            await fetch(`${API_BASE_URL}/cart/add`, {
              method: 'POST',
              headers: getAuthHeaders(),
              body: JSON.stringify({
                productId: item.id || item._id,
                quantity: item.quantity,
                size: item.size || 'Standard'
              })
            });
          } catch (err) {
            console.error('Error syncing item:', err);
          }
        }
      }
      // Then fetch the server cart
      await fetchCartFromServer();
    }
  };

  const value = {
    cart,
    loading,
    error,
    isAuthenticated,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    fetchCartFromServer,
    syncCartWithServer
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
