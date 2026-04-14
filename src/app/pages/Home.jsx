import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { products } from '../data/products';
import {
  getProductsFromCache,
  setProductsToCache,
  getSearchHistory,
  addToSearchHistory,
  saveFilterSelection,
  getFilterSelection
} from '../utils/cache';

export const Home = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Get unique categories
  const categories = ['All', ...new Set(products.map(p => p.category))];

  // Load products with caching
  useEffect(() => {
    const loadProducts = async () => {
      // Check cache first
      const cachedProducts = getProductsFromCache();

      if (cachedProducts) {
        // Load from cache instantly
        setAllProducts(cachedProducts);
        setFilteredProducts(cachedProducts);
        setLoading(false);
      } else {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setAllProducts(products);
        setFilteredProducts(products);
        setProductsToCache(products);
        setLoading(false);
      }
    };

    loadProducts();
    setSearchHistory(getSearchHistory());
    setSelectedCategory(getFilterSelection());
  }, []);

  // Filter products based on search and category
  useEffect(() => {
    let filtered = allProducts;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, allProducts]);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Product Catalog</h1>

      {/* Search and Filter Section */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="mt-4 flex items-center space-x-2">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchQuery && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                Search: "{searchQuery}"
              </span>
            )}
            {selectedCategory !== 'All' && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Category: {selectedCategory}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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