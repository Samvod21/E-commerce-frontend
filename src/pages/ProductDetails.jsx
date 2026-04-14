import { useParams, Link } from 'react-router-dom';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const product = products.find(p => p.id === parseInt(id));
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    if (product) {
      const related = products
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 3);
      setRelatedProducts(related);
    }
  }, [product]);

  if (!product) return (
    <div className="p-10 text-center">
      <h2 className="text-2xl font-bold text-gray-400 mb-4">Product not found</h2>
      <Link to="/" className="text-blue-600 hover:underline">Return to Home</Link>
    </div>
  );

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const images = [
    product.image,
    product.image.replace('400', '401'),
    product.image.replace('400', '402')
  ].filter((img, index, self) => self.indexOf(img) === index);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Link to="/" className="text-blue-600 mb-6 inline-flex items-center gap-2 hover:gap-3 transition-all">
        ← Back to Catalog
      </Link>
      
      <div className="grid md:grid-cols-2 gap-12 bg-white p-8 rounded-2xl shadow-sm border mb-12">
        <div>
          <div className="bg-gray-100 rounded-xl h-96 flex items-center justify-center mb-4 overflow-hidden">
            <img 
              src={images[selectedImage]} 
              alt={product.name} 
              className="max-h-full object-contain hover:scale-110 transition-transform duration-500" 
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index ? 'border-blue-600' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt={`${product.name} view ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <div className="mb-6">
            <span className="text-sm text-gray-500 uppercase tracking-widest">{product.category}</span>
            <h1 className="text-4xl font-bold mt-2 mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-yellow-400">
                {'★'.repeat(Math.floor(product.rating || 4))}
                {'☆'.repeat(5 - Math.floor(product.rating || 4))}
              </div>
              <span className="text-sm text-gray-500">({product.reviews || 128} reviews)</span>
            </div>
            <p className="text-3xl text-blue-600 font-bold mb-6">${product.price}</p>
            <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>
          </div>
          
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                product.stock > 10 ? 'bg-green-100 text-green-700' : 
                product.stock > 0 ? 'bg-yellow-100 text-yellow-700' : 
                'bg-red-100 text-red-700'
              }`}>
                {product.stock > 10 ? 'In Stock' : 
                 product.stock > 0 ? `Only ${product.stock} left` : 
                 'Out of Stock'}
              </span>
              {product.stock > 0 && product.stock <= 10 && (
                <span className="text-orange-600 text-sm animate-pulse">⚠️ Selling fast!</span>
              )}
            </div>

            <div className="flex items-center gap-4 mb-6">
              <label className="text-gray-700 font-medium">Quantity:</label>
              <div className="flex items-center border rounded-lg overflow-hidden">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-gray-100 transition-colors font-bold"
                  disabled={quantity === 1}
                >
                  −
                </button>
                <span className="px-6 py-2 font-medium border-x bg-gray-50">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-4 py-2 hover:bg-gray-100 transition-colors font-bold"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>

            <button 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full text-white py-4 rounded-xl font-bold transition-all transform hover:scale-105 disabled:bg-gray-300 disabled:hover:scale-100 ${
                addedToCart ? 'bg-green-600' : 'bg-slate-900 hover:bg-slate-800'
              }`}
            >
              {addedToCart ? '✓ Added to Cart!' : 'Add to Shopping Cart'}
            </button>

            {addedToCart && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl animate-in slide-in-from-top duration-300">
                <p className="text-green-800">
                  <span className="font-bold">Success!</span> {quantity} {quantity === 1 ? 'item' : 'items'} added to your cart.
                </p>
                <Link to="/cart" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                  View Cart & Checkout →
                </Link>
              </div>
            )}
          </div>

          <div className="border-t pt-6 space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>🚚</span>
              <span>Free shipping on orders over $100</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>🔄</span>
              <span>30-day easy returns</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>🔒</span>
              <span>Secure checkout</span>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedProducts.map(p => (
              <Link 
                key={p.id} 
                to={`/product/${p.id}`}
                className="group bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition-all"
              >
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                  <img 
                    src={p.image} 
                    alt={p.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">{p.name}</h3>
                <p className="text-blue-600 font-bold">${p.price}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;