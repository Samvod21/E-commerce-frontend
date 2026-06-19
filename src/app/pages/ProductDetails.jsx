import { useParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, ShoppingCart, Check, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useEffect, useMemo, useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api/products', '')
  : 'http://localhost:5000';

const withImageUrl = (product) => {
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

export const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/products/${id}`);
        const data = await res.json();
        if (cancelled) return;

        if (res.ok) {
          const normalised = withImageUrl(data);
          // Ensure product.id matches the route param (backend uses Mongo _id)
          normalised.id = String(normalised.id ?? normalised._id ?? id);
          setProduct(normalised);
        } else {
          setProduct(null);
        }
      } catch (e) {
        console.warn('Could not load product details:', e);
        if (!cancelled) setProduct(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const productNotFound = useMemo(() => !loading && !product, [loading, product]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (productNotFound) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <Link to="/" className="text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!product) return null;


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-96 object-cover"
          />
        </div>

        {/* Product Details */}
        <div>
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm mb-2">
              {product.category}
            </span>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-4xl font-bold text-blue-600 mb-4">
              ${product.price.toFixed(2)}
            </p>
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-700">Stock Status:</span>
              <span className={`px-3 py-1 rounded ${product.stock > 10
                ? 'bg-green-100 text-green-800'
                : product.stock > 0
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
                }`}>
                {product.stock > 0
                  ? `${product.stock} units available`
                  : 'Out of stock'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>

          {/* Product Features */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Product Features</h3>
            <ul className="space-y-1 text-gray-700">
              <li>• Product ID: #{product.id}</li>
              <li>• Category: {product.category}</li>
              <li>• Price: ${product.price.toFixed(2)}</li>
              <li>• Available Stock: {product.stock} units</li>
              {product.sizes && product.sizes.length > 0 && (
                <li>• Sizes: {product.sizes.join(', ')}</li>
              )}
            </ul>
          </div>

          {/* Add to Cart Button */}
          <div className="space-y-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2 text-lg font-semibold"
            >
              {added ? (
                <>
                  <Check className="h-5 w-5" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  <span>{product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                </>
              )}
            </button>

            <Link
              to="/cart"
              className="w-full block text-center border-2 border-blue-600 text-blue-600 py-3 px-6 rounded-lg hover:bg-blue-50 transition-colors duration-200"
            >
              View Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};