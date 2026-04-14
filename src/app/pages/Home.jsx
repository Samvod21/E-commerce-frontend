import React, { useContext, useState } from 'react';
import { CartContext } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import '../styles/app.css'; // Import your custom CSS

const Home = () => {
  const { products, loading, searchCache, updateSearchCache } = useContext(CartContext);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  // Instant filtering logic [cite: 17]
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) && 
    (category === 'All' || p.category === category)
  );

  return (
    <div className="container">
      <div className="filter-section" style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input 
          className="search-input"
          style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onBlur={() => updateSearchCache(search)} // Caches the query [cite: 52]
        />
        <select 
          style={{ padding: '10px', borderRadius: '4px' }}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Fashion">Fashion</option>
          <option value="Home">Home</option>
        </select>
      </div>

      {/* Recent Search Suggestions [cite: 53] */}
      {searchCache.length > 0 && (
        <div style={{ marginBottom: '20px', fontSize: '0.9rem', color: '#666' }}>
          Recent searches: {searchCache.map(s => (
            <span key={s} className="search-tag" onClick={() => setSearch(s)} style={{ marginRight: '10px', cursor: 'pointer', textDecoration: 'underline' }}>
              {s}
            </span>
          ))}
        </div>
      )}

      {loading ? (
        <p>Loading products... (Simulated 500ms delay)</p>
      ) : (
        <div className="product-grid"> {/* Uses your CSS grid  */}
          {filteredProducts.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;