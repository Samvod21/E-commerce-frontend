import React, { createContext, useState, useEffect } from 'react';
import { products as initialProducts } from '../data/products';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || []);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchCache, setSearchCache] = useState(JSON.parse(localStorage.getItem('searchCache')) || []);

  // 1. Product Caching Logic with 5-minute expiry
  const fetchProducts = () => {
    const cachedData = JSON.parse(localStorage.getItem('productCache'));
    const now = new Date().getTime();

    if (cachedData && (now - cachedData.timestamp < 300000)) { // 300,000ms = 5 mins
      setProducts(cachedData.data);
    } else {
      setLoading(true);
      setTimeout(() => {
        setProducts(initialProducts);
        localStorage.setItem('productCache', JSON.stringify({ data: initialProducts, timestamp: now }));
        setLoading(false);
      }, 500); // Simulate network delay
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. Persist Cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? {...item, qty: item.qty + 1} : item);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateSearchCache = (query) => {
    if (!query) return;
    setSearchCache(prev => {
      const filtered = prev.filter(q => q !== query);
      const updated = [query, ...filtered].slice(0, 3); // Keep last 3 unique
      localStorage.setItem('searchCache', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <CartContext.Provider value={{ cart, setCart, products, loading, addToCart, searchCache, updateSearchCache }}>
      {children}
    </CartContext.Provider>
  );
};