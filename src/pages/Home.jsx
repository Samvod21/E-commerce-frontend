import { useState, useEffect } from "react";
import { products as localData } from "../data/products";
import { Link } from "react-router-dom";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');

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
      }, 500); // Simulated delay [cite: 47]
    }
  }, []);

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (category === 'All' || p.category === category)
  );

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      {/* Search & Filter Bar [cite: 14, 15, 16] */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <input 
          type="text" 
          placeholder="Search products..." 
          className="border p-2 rounded-lg flex-grow shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="border p-2 rounded-lg bg-white shadow-sm"
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Clothing">Clothing</option>
          <option value="Accessories">Accessories</option>
        </select>
      </div>

      {/* Grid [cite: 11, 12] */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(p => (
          <div key={p.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-gray-100">
            <img src={p.image} alt={p.name} className="w-full h-48 object-cover bg-gray-200" />
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1">{p.name}</h3>
              <p className="text-blue-600 font-semibold mb-2">${p.price}</p>
              <div className="flex justify-between items-center">
                <span className={`text-xs px-2 py-1 rounded-full ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {p.stock > 0 ? `In Stock (${p.stock})` : 'Out of Stock'}
                </span>
                <Link to={`/product/${p.id}`} className="text-blue-500 hover:underline text-sm font-medium">Details →</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;