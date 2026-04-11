import { useParams, Link } from 'react-router-dom';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const product = products.find(p => p.id === parseInt(id));

  if (!product) return <div className="p-10 text-center">Product not found.</div>;

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <Link to="/" className="text-blue-600 mb-6 inline-block">← Back to Catalog</Link>
      <div className="grid md:grid-cols-2 gap-12 bg-white p-8 rounded-2xl shadow-sm border">
        <div className="bg-gray-100 rounded-xl h-96 flex items-center justify-center">
          <img src={product.image} alt={product.name} className="max-h-full" />
        </div>
        <div>
          <span className="text-sm text-gray-500 uppercase tracking-widest">{product.category}</span>
          <h1 className="text-4xl font-bold mt-2 mb-4">{product.name}</h1>
          <p className="text-2xl text-blue-600 font-bold mb-6">${product.price}</p>
          <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>
          
          <div className="mb-6">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {product.stock > 0 ? `${product.stock} units available` : 'Out of Stock'}
            </span>
          </div>

          <button 
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition disabled:bg-gray-300"
          >
            Add to Shopping Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;