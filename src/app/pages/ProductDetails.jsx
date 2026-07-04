import { useParams, Link, useNavigate } from 'react-router';
import { ArrowLeft, ShoppingCart, Check, Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useCart } from '../context/CartContext';

const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api/products', '')
  : 'http://localhost:5000';

const withImageUrl = (product) => {
  if (!product?.image) return product;
  if (typeof product.image === 'string') {
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
  // Which size is currently selected. product.sizes is now an array of
  // { size, price } pairs, so the price shown/added to cart depends on this.
  const [selectedSize, setSelectedSize] = useState(null);

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

  // Default to the first available size whenever a (new) product loads.
  useEffect(() => {
    if (product?.sizes?.length) {
      setSelectedSize(product.sizes[0].size);
    } else {
      setSelectedSize(null);
    }
  }, [product]);

  const selectedSizeEntry = product?.sizes?.find((s) => s.size === selectedSize);
  const displayPrice = selectedSizeEntry ? selectedSizeEntry.price : product?.price;

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, selectedSize, displayPrice);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const productNotFound = useMemo(() => !loading && !product, [loading, product]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (productNotFound) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">Product Not Found</h2>
          <Link to="/" className="text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-5 flex items-center gap-2 text-gray-600 hover:text-gray-900 sm:mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back</span>
      </button>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
        <div className="overflow-hidden rounded-lg bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="h-72 w-full object-cover sm:h-96"
          />
        </div>

        <div>
          <div className="mb-4">
            <span className="mb-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
              {product.category}
            </span>
            <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">{product.name}</h1>
            <p className="mb-4 text-3xl font-bold text-blue-600 sm:text-4xl">
              ${displayPrice?.toFixed(2)}
            </p>
          </div>

          {/* Size picker — only shown when the seller configured more than one size.
              Each size can have its own price, so selecting a size updates displayPrice above. */}
          {product.sizes && product.sizes.length > 1 && (
            <div className="mb-6">
              <span className="mb-2 block font-semibold text-gray-700">Size</span>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s.size}
                    type="button"
                    onClick={() => setSelectedSize(s.size)}
                    className={`rounded-lg border px-4 py-2 text-sm transition-colors ${selectedSize === s.size
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:border-blue-300'
                      }`}
                  >
                    {s.size} · ${s.price.toFixed(2)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-gray-700">Stock Status:</span>
              <span className={`rounded px-3 py-1 ${product.stock > 10
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

          <div className="mb-6">
            <h2 className="mb-2 text-xl font-semibold text-gray-900">Description</h2>
            <p className="leading-relaxed text-gray-700">{product.description}</p>
          </div>

          <div className="mb-6 rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 font-semibold text-gray-900">Product Features</h3>
            <ul className="space-y-1 wrap-break-word text-gray-700">
              <li>Product ID: #{product.id}</li>
              <li>Category: {product.category}</li>
              <li>Price: ${displayPrice?.toFixed(2)}{selectedSize ? ` (${selectedSize})` : ''}</li>
              <li>Available Stock: {product.stock} units</li>
              {product.sizes && product.sizes.length > 0 && (
                <li>Sizes: {product.sizes.map((s) => `${s.size} ($${s.price.toFixed(2)})`).join(', ')}</li>
              )}
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white transition-colors duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 sm:text-lg"
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
              className="block w-full rounded-lg border-2 border-blue-600 px-6 py-3 text-center text-blue-600 transition-colors duration-200 hover:bg-blue-50"
            >
              View Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
