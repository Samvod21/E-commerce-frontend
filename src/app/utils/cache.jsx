// Product data stays backend-owned; this short-lived memory cache only avoids
// duplicate catalog requests while navigating within the app.
const PRODUCT_CACHE_TTL_MS = 30_000;
let productsCache = null;
let productsCachedAt = 0;
let productsCacheRevision = 0;
let productsRequest = null;

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
export const getProductsFromCache = () => {
  if (productsCache && Date.now() - productsCachedAt < PRODUCT_CACHE_TTL_MS) {
    return productsCache;
  }

  return null;
};
export const setProductsToCache = (products) => {
  productsCache = products;
  productsCachedAt = Date.now();
  return products;
};
export const invalidateProductsCache = () => {
  productsCacheRevision += 1;
  productsCache = null;
  productsCachedAt = 0;
  productsRequest = null;
};
export const getOrFetchProducts = (fetchProducts) => {
  const cachedProducts = getProductsFromCache();
  if (cachedProducts) return Promise.resolve(cachedProducts);
  if (productsRequest) return productsRequest.promise;

  const revision = productsCacheRevision;
  const promise = Promise.resolve()
    .then(fetchProducts)
    .then((products) => {
      if (revision === productsCacheRevision) setProductsToCache(products);
      return products;
    })
    .finally(() => {
      if (productsRequest?.promise === promise) productsRequest = null;
    });

  productsRequest = { promise };
  return promise;
};
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
