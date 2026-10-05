import { useState, useEffect, useMemo } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import {
  getSearchHistory,
  addToSearchHistory,
  saveFilterSelection,
  getFilterSelection,
  getOrFetchProducts
} from '../utils/cache';

const PRODUCTS_PER_PAGE = 12;

const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api/products', '')
  : 'http://localhost:5000';

const withImageUrl = (product) => {
  // Backend returns image: "/uploads/<filename>"
  if (!product?.image) return product;
  if (typeof product.image === 'string') {
    // New approach: image is stored as data URL in Mongo, so just keep it.
    // Also keep backwards compatibility for old /uploads paths.
    if (product.image.startsWith('data:image/')) return product;
    if (product.image.startsWith('/uploads/')) {
      return { ...product, image: `${API_BASE}${product.image}` };
    }
  }
  return product;
};

export const Home = () => {
  const [allProducts, setAllProducts] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');

  const [selectedCategory, setSelectedCategory] = useState(() => getFilterSelection());
  const [loading, setLoading] = useState(true);
  const [searchHistory, setSearchHistory] = useState(() => getSearchHistory());
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Get unique categories
  const categories = useMemo(() => {
    return ['All', ...new Set(allProducts.map(p => p.category).filter(Boolean))];
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    let filtered = allProducts;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [allProducts, searchQuery, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const visibleProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // Keep API data in memory briefly to avoid refetching during navigation.
  useEffect(() => {
    let cancelled = false;

    const loadProducts = async () => {
      try {
        setLoading(true);
        const products = await getOrFetchProducts(async () => {
          const res = await fetch(`${API_BASE}/api/products`);
          if (!res.ok) throw new Error(`Product request failed (${res.status})`);
          const data = await res.json();
          const backendProducts = Array.isArray(data) ? data : (data?.products ?? []);
          return backendProducts
            .map(withImageUrl)
            .map((p) => ({
              ...p,
              // Use Mongo _id for routing when backend doesn't provide id.
              id: String(p.id ?? p._id ?? p.productId ?? ''),
            }))
            .filter((p) => p.id);
        });

        if (!cancelled) setAllProducts(products);
      } catch (e) {
        console.warn('Backend product fetch failed:', e);
        if (!cancelled) setAllProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);


  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addToSearchHistory(searchQuery);
      setSearchHistory(getSearchHistory());
      setShowSuggestions(false);
    }
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    saveFilterSelection(category);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    addToSearchHistory(suggestion);
    setSearchHistory(getSearchHistory());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="mb-4 text-2xl font-bold text-gray-900 sm:mb-8 sm:text-4xl">Product Catalog</h1>

      {/* Search and Filter Section */}
      <div className="mb-6 rounded-lg bg-white p-3 shadow-md sm:mb-8 sm:p-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
          {/* Search Box */}
          <div className="relative">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-3 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:py-2 sm:text-base"
                />
              </div>
            </form>

            {/* Search Suggestions */}
            {showSuggestions && searchHistory.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                <div className="p-2">
                  <p className="text-xs text-gray-500 px-2 mb-1">Recent searches</p>
                  {searchHistory.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded text-sm"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:py-2 sm:text-base"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'All' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchQuery || selectedCategory !== 'All') && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="w-full text-sm text-gray-600 sm:w-auto">Active filters:</span>
            {searchQuery && (
              <span className="max-w-full truncate rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                Search: "{searchQuery}"
              </span>
            )}
            {selectedCategory !== 'All' && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
                Category: {selectedCategory}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <>
          <p className="mb-3 text-sm text-gray-600" aria-live="polite">
            Showing {(currentPage - 1) * PRODUCTS_PER_PAGE + 1}–{Math.min(currentPage * PRODUCTS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} products
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {visibleProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                loading={index < 4 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : 'auto'}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <nav className="mt-6 flex items-center justify-between gap-3" aria-label="Product pages">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600" aria-current="page">Page {currentPage} of {totalPages}</span>
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};
