// Product cache utilities
export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const getProductsFromCache = () => {
  const cached = localStorage.getItem('productCache');
  if (!cached) return null;

  const { products, timestamp } = JSON.parse(cached);
  const now = Date.now();

  // Check if cache is still valid (within 5 minutes)
  if (now - timestamp < CACHE_DURATION) {
    return products;
  }

  return null;
};

export const setProductsToCache = (products) => {
  const cacheData = {
    products,
    timestamp: Date.now()
  };
  localStorage.setItem('productCache', JSON.stringify(cacheData));
};

// Search history cache
export const getSearchHistory = () => {
  const history = localStorage.getItem('searchHistory');
  return history ? JSON.parse(history) : [];
};

export const addToSearchHistory = (query) => {
  if (!query.trim()) return;

  let history = getSearchHistory();

  // Remove duplicate if exists
  history = history.filter(item => item !== query);

  // Add to beginning
  history.unshift(query);

  // Keep only last 3 unique searches
  history = history.slice(0, 3);

  localStorage.setItem('searchHistory', JSON.stringify(history));
};

// Filter selection cache (session storage for current session)
export const saveFilterSelection = (category) => {
  sessionStorage.setItem('lastFilterCategory', category);
};

export const getFilterSelection = () => {
  return sessionStorage.getItem('lastFilterCategory') || 'All';
};