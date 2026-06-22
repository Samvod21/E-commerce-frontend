// Cache utilities are intentionally removed.
// Products must come from the backend MongoDB only.

// Orders helpers (kept as safe defaults; orders are managed by backend)
export const getOrders = () => [];
export const setOrders = () => { };
export const markOrderDelivered = () => { };

// Backoffice product helpers are no-ops in this configuration.
// Products are expected to be created/updated/deleted via backend APIs.
export const getPersistedProducts = () => [];
export const setPersistedProducts = () => { };
export const addProductToCache = (product) => product;
export const updatePersistedProduct = (updatedProduct) => updatedProduct;
export const deletePersistedProduct = () => { };
export const refreshProductsCache = () => [];
export const getProductsFromCache = () => null;
export const setProductsToCache = () => { };
export const getAllProducts = () => [];


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
