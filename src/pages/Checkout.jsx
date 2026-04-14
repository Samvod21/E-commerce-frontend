import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const Checkout = () => {
  const { cart, total, clearCart } = useCart();
  const [formData, setFormData] = useState({ name: '', email: '', address: '', city: '', zip: '', cardNumber: '', expiry: '', cvv: '' });
  const [ordered, setOrdered] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) newErrors.email = 'Valid email is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.zip.match(/^\d{5}$/)) newErrors.zip = 'Valid 5-digit ZIP code required';
    if (!formData.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) newErrors.cardNumber = 'Valid 16-digit card number required';
    if (!formData.expiry.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)) newErrors.expiry = 'Valid MM/YY format required';
    if (!formData.cvv.match(/^\d{3,4}$/)) newErrors.cvv = 'Valid CVV required';
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setProcessing(true);
    setErrors({});

    // Simulate payment processing
    setTimeout(() => {
      const newOrder = {
        id: Date.now(),
        orderNumber: `ORD-${Date.now().toString().slice(-8)}`,
        date: new Date().toLocaleDateString(),
        items: cart,
        total: total,
        shippingAddress: `${formData.address}, ${formData.city} ${formData.zip}`
      };

      const pastOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      localStorage.setItem('orders', JSON.stringify([...pastOrders, newOrder]));
      
      setOrderNumber(newOrder.orderNumber);
      clearCart();
      setOrdered(true);
      setProcessing(false);
    }, 2000);
  };

  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16) {
      value = value.replace(/(.{4})/g, '$1 ').trim();
      setFormData({...formData, cardNumber: value});
    }
  };

  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0,2) + '/' + value.slice(2,4);
    }
    setFormData({...formData, expiry: value});
  };

  if (ordered) return (
    <div className="max-w-md mx-auto my-12 bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center">
      <div className="text-6xl mb-4 animate-bounce">✅</div>
      <h2 className="text-2xl font-black text-slate-800 mb-2">Order Confirmed!</h2>
      <p className="text-gray-600 mb-2">Thank you for your purchase, {formData.name}!</p>
      <p className="text-sm text-gray-500 mb-6">Order #{orderNumber}</p>
      <div className="bg-blue-50 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-800">A confirmation email has been sent to {formData.email}</p>
      </div>
      <Link 
        to="/orders" 
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
      >
        View Order History
      </Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto my-12 p-6">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            <h2 className="text-2xl font-black text-slate-800 mb-6">Shipping & Payment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                  <input 
                    className={`w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all ${
                      errors.name ? 'border-red-500' : 'border-slate-200'
                    }`}
                    type="text" 
                    placeholder="John Doe" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                  <input 
                    className={`w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all ${
                      errors.email ? 'border-red-500' : 'border-slate-200'
                    }`}
                    type="email" 
                    placeholder="john@example.com" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-1">Street Address</label>
                  <input 
                    className={`w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all ${
                      errors.address ? 'border-red-500' : 'border-slate-200'
                    }`}
                    type="text" 
                    placeholder="123 Main St" 
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: e.target.value})} 
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">City</label>
                  <input 
                    className={`w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all ${
                      errors.city ? 'border-red-500' : 'border-slate-200'
                    }`}
                    type="text" 
                    placeholder="New York" 
                    value={formData.city} 
                    onChange={e => setFormData({...formData, city: e.target.value})} 
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">ZIP Code</label>
                  <input 
                    className={`w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all ${
                      errors.zip ? 'border-red-500' : 'border-slate-200'
                    }`}
                    type="text" 
                    placeholder="10001" 
                    maxLength="5"
                    value={formData.zip} 
                    onChange={e => setFormData({...formData, zip: e.target.value.replace(/\D/g, '')})} 
                  />
                  {errors.zip && <p className="text-red-500 text-xs mt-1">{errors.zip}</p>}
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="font-bold text-slate-800 mb-4">Payment Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Card Number</label>
                    <input 
                      className={`w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all ${
                        errors.cardNumber ? 'border-red-500' : 'border-slate-200'
                      }`}
                      type="text" 
                      placeholder="4242 4242 4242 4242" 
                      value={formData.cardNumber} 
                      onChange={handleCardNumberChange} 
                    />
                    {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Expiry (MM/YY)</label>
                      <input 
                        className={`w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all ${
                          errors.expiry ? 'border-red-500' : 'border-slate-200'
                        }`}
                        type="text" 
                        placeholder="12/25" 
                        maxLength="5"
                        value={formData.expiry} 
                        onChange={handleExpiryChange} 
                      />
                      {errors.expiry && <p className="text-red-500 text-xs mt-1">{errors.expiry}</p>}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">CVV</label>
                      <input 
                        className={`w-full p-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all ${
                          errors.cvv ? 'border-red-500' : 'border-slate-200'
                        }`}
                        type="password" 
                        placeholder="123" 
                        maxLength="4"
                        value={formData.cvv} 
                        onChange={e => setFormData({...formData, cvv: e.target.value.replace(/\D/g, '')})} 
                      />
                      {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
                    </div>
                  </div>
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={processing}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Processing...
                  </span>
                ) : (
                  'Place Secure Order'
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 sticky top-24">
            <h3 className="font-bold text-slate-800 mb-4">Order Summary</h3>
            <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    <span className="text-gray-500">{item.qty}x</span> {item.name}
                  </span>
                  <span className="font-medium">${(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <Link to="/cart" className="text-blue-600 text-sm hover:underline mt-4 inline-block">
              ← Edit Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;