import { Link } from 'react-router';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  // Products can now have multiple sizes, each with its own price. A single
  // "Add to Cart" click on the card can't know which size/price the buyer
  // wants, so for those products we let the click fall through to the
  // surrounding <Link> and send the buyer to the product page to choose.
  const hasMultipleSizes = Array.isArray(product.sizes) && product.sizes.length > 1;

  const handleAddToCart = (e) => {
    if (hasMultipleSizes) return;
    e.preventDefault();
    const only = product.sizes?.[0];
    addToCart(product, only?.size || 'Standard', only?.price ?? product.price);
  };

  return (
    <Link to={`/product/${product.id ?? product._id}`} className="group block h-full">
      <div className="flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-md transition-shadow duration-300 hover:shadow-xl">
        <div className="aspect-w-16 aspect-h-12 overflow-hidden bg-gray-200">
          <img
            src={product.image}
            alt={product.name}
            className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105 sm:h-48"
          />
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
            {product.name}
          </h3>

          <p className="text-sm text-gray-600 mb-2">{product.category}</p>

          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xl font-bold text-blue-600 sm:text-2xl">
              {hasMultipleSizes ? `From $${product.price.toFixed(2)}` : `$${product.price.toFixed(2)}`}
            </span>
            <span className={`rounded px-2 py-1 text-xs sm:text-sm ${product.stock > 10
                ? 'bg-green-100 text-green-800'
                : product.stock > 0
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>{product.stock === 0 ? 'Out of Stock' : hasMultipleSizes ? 'Select Size' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </Link>
  );
};
