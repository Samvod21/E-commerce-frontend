import { useState, useEffect } from "react";
import { products as localData } from "../data/products";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('grid');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const { addToCart } = useCart();
  const [addedToCartId, setAddedToCartId] = useState(null);

  useEffect(() => {
    const CACHE_KEY = 'product_cache';
    const CACHE_TIME_KEY = 'product_cache_time';
    const fiveMinutes = 5 * 60 * 1000;
    const now = Date.now();
    const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

    if (cachedTime && (now - cachedTime < fiveMinutes)) {
      setProducts(JSON.parse(localStorage.getItem(CACHE_KEY)));
      setLoading(false);
    } else {
      setLoading(true);
      setTimeout(() => {
        setProducts(localData);
        localStorage.setItem(CACHE_KEY, JSON.stringify(localData));
        localStorage.setItem(CACHE_TIME_KEY, now.toString());
        setLoading(false);
      }, 500); 
    }
  }, []);

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (category === 'All' || p.category === category)
  );

  const sortedProducts = [...filtered].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const handleQuickAdd = (product) => {
    addToCart(product);
    setAddedToCartId(product.id);
    setTimeout(() => setAddedToCartId(null), 2000);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading products...</p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      {/* Filters Section */}
      <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-grow">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search products..." 
                className="w-full border p-3 pl-10 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <select 
              className="border p-3 rounded-xl bg-white shadow-sm min-w-[150px]"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <select 
              className="border p-3 rounded-xl bg-white shadow-sm min-w-[150px]"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Sort by</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>

            <div className="flex border rounded-xl overflow-hidden">
              <button 
                onClick={() => setViewMode('grid')}
                className={`px-4 py-3 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}
              >
                🔲
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`px-4 py-3 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'}`}
              >
                📋
              </button>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-500">
          Showing {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'}
        </div>
      </div>

      {/* Products Grid */}
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        : "space-y-4"
      }>
        {sortedProducts.map(p => (
          <div 
            key={p.id} 
            className={viewMode === 'grid'
              ? "group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              : "bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all"
            }
          >
            {viewMode === 'grid' ? (
              <>
                <div className="relative aspect-square bg-slate-100 overflow-hidden">
                  <img 
                    src={p.image} 
                    alt={p.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                    onClick={() => setQuickViewProduct(p)}
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${p.stock > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                      {p.stock > 0 ? 'In Stock' : 'Sold Out'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleQuickAdd(p)}
                    disabled={p.stock === 0}
                    className="absolute bottom-3 right-3 bg-white text-slate-900 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600 hover:text-white disabled:opacity-0"
                  >
                    {addedToCartId === p.id ? '✓' : '🛒'}
                  </button>
                </div>
                <div className="p-5">
                  <p className="text-xs text-slate-400 uppercase font-semibold mb-1">{p.category}</p>
                  <h3 className="font-bold text-slate-800 text-lg mb-2 line-clamp-1">{p.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{p.description}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-xl font-black text-blue-600">${p.price}</span>
                    <Link to={`/product/${p.id}`} className="bg-slate-900 text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors">
                      Details
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center p-4 gap-4">
                <img src={p.image} alt={p.name} className="w-24 h-24 object-cover rounded-lg" />
                <div className="flex-grow">
                  <h3 className="font-bold text-slate-800">{p.name}</h3>
                  <p className="text-sm text-gray-500">{p.category}</p>
                  <p className="text-sm text-gray-600 line-clamp-1">{p.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-blue-600">${p.price}</p>
                  <p className={`text-xs ${p.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {p.stock > 0 ? `${p.stock} in stock` : 'Sold Out'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleQuickAdd(p)}
                    disabled={p.stock === 0}
                    className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                  >
                    🛒
                  </button>
                  <Link to={`/product/${p.id}`} className="p-2 hover:bg-gray-100 rounded-lg transition">
                    →
                  </Link>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {sortedProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">No products found matching your criteria</p>
          <button 
            onClick={() => {
              setSearchTerm('');
              setCategory('All');
              setSortBy('default');
            }}
            className="mt-4 text-blue-600 hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setQuickViewProduct(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="relative">
              <button 
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"
              >
                ✕
              </button>
              <img src={quickViewProduct.image} alt={quickViewProduct.name} className="w-full h-64 object-cover" />
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-2">{quickViewProduct.name}</h2>
              <p className="text-blue-600 text-xl font-bold mb-4">${quickViewProduct.price}</p>
              <p className="text-gray-600 mb-6">{quickViewProduct.description}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handleQuickAdd(quickViewProduct);
                    setQuickViewProduct(null);
                  }}
                  disabled={quickViewProduct.stock === 0}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  Add to Cart
                </button>
                <Link
                  to={`/product/${quickViewProduct.id}`}
                  className="flex-1 border-2 border-slate-900 text-slate-900 py-3 rounded-xl font-bold hover:bg-slate-900 hover:text-white transition text-center"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;