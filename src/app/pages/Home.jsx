import { useState, useEffect, useMemo } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import {
  getSearchHistory,
  addToSearchHistory,
  saveFilterSelection,
  getFilterSelection
} from '../utils/cache';


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

  // Load products directly from backend (no product caching/localstorage)
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/products`);
        const data = await res.json();
        const backendProducts = Array.isArray(data) ? data : (data?.products ?? []);
        const normalised = backendProducts
          .map(withImageUrl)
          .map((p) => ({
            ...p,
            // Use Mongo _id for routing when backend doesn't provide id.
            id: String(p.id ?? p._id ?? p.productId ?? ''),
          }))
          .filter((p) => p.id);

        setAllProducts(normalised);
      } catch (e) {
        console.warn('Backend product fetch failed:', e);
        setAllProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
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
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="mb-5 text-3xl font-bold text-gray-900 sm:mb-8 sm:text-4xl">Product Catalog</h1>

      {/* Search and Filter Section */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow-md sm:mb-8 sm:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:py-2"
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
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:py-2"
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};
