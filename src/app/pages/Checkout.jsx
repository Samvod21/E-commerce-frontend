import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useCart } from '../context/CartContext';
import { CheckCircle, CreditCard } from 'lucide-react';

function detectCardType(value) {
  const n = value.replace(/\D/g, '');
  if (/^4/.test(n))           return 'Visa';
  if (/^5[1-5]/.test(n))     return 'Mastercard';
  if (/^2[2-7]/.test(n))     return 'Mastercard';
  if (/^3[47]/.test(n))      return 'Amex';
  if (/^6(?:011|5)/.test(n)) return 'Discover';
  return '';
}
function formatCardNumber(raw) { return raw.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim(); }
function formatExpiry(raw) { const d=raw.replace(/\D/g,'').slice(0,4); return d.length<=2?d:d.slice(0,2)+'/'+d.slice(2); }

export const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getCartTotal, clearCart } = useCart();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name:'', email:'', address:'',
    cardHolder:'', cardNumber:'', expiry:'', cvv:''
  });

  if (cart.length === 0 && !orderPlaced) return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <Link to="/" className="text-blue-600 hover:underline">Continue Shopping</Link>
      </div>
    </div>
  );

  const validateForm = () => {
    const e = {};
    if (!formData.name.trim()) e.name='Full name is required';
    if (!formData.email.trim()) e.email='Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) e.email='Email is invalid';
    if (!formData.address.trim()) e.address='Address is required';
    if (!formData.cardHolder.trim()) e.cardHolder='Cardholder name is required';
    const raw=formData.cardNumber.replace(/\D/g,'');
    if (!raw||raw.length<13||raw.length>19) e.cardNumber='Enter a valid card number';
    if (!formData.expiry||!/^\d{2}\/\d{2}$/.test(formData.expiry)) { e.expiry='Enter expiry as MM/YY'; }
    else {
      const [mm,yy]=formData.expiry.split('/').map(Number); const now=new Date(); const fy=2000+yy;
      if (mm<1||mm>12) e.expiry='Invalid month';
      else if (fy<now.getFullYear()||(fy===now.getFullYear()&&mm<now.getMonth()+1)) e.expiry='Card has expired';
    }
    if (!formData.cvv||!/^\d{3,4}$/.test(formData.cvv)) e.cvv='CVV must be 3 or 4 digits';
    setErrors(e); return Object.keys(e).length===0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let v=value;
    if (name==='cardNumber') v=formatCardNumber(value);
    if (name==='expiry') v=formatExpiry(value);
    if (name==='cvv') v=value.replace(/\D/g,'').slice(0,4);
    setFormData(p=>({...p,[name]:v}));
    if (errors[name]) setErrors(p=>({...p,[name]:''}));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); if (!validateForm()) return; setSubmitting(true);
    try {
      const token=localStorage.getItem('token'); if (!token){navigate('/login');return;}
      const API_BASE=import.meta.env.VITE_API_URL
        ?import.meta.env.VITE_API_URL.replace('/api/products',''):'http://localhost:5000';
      const res=await fetch(`${API_BASE}/api/orders`,{
        method:'POST',
        headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},
        body:JSON.stringify({
          customerInfo:{name:formData.name,email:formData.email,address:formData.address},
          paymentInfo:{cardHolder:formData.cardHolder,cardNumber:formData.cardNumber.replace(/\s/g,''),expiry:formData.expiry,cvv:formData.cvv}
        })
      });
      const data=await res.json();
      if (!res.ok||!data.success) throw new Error(data?.message||'Failed to place order');
      await clearCart(); setOrderPlaced(true); setTimeout(()=>navigate('/orders'),1500);
    } catch(err){ setErrors(p=>({...p,form:err.message||'Could not place order.'})); }
    finally { setSubmitting(false); }
  };

  if (orderPlaced) return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="max-w-md mx-auto text-center py-12">
        <CheckCircle className="mx-auto mb-4 h-20 w-20 text-green-500 sm:h-24 sm:w-24" />
        <h2 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">Order Placed Successfully!</h2>
        <p className="text-gray-600 mb-6">Thank you for your purchase.</p>
        <p className="text-sm text-gray-500">Redirecting to order history...</p>
      </div>
    </div>
  );

  const cardType=detectCardType(formData.cardNumber);

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="mb-5 text-3xl font-bold text-gray-900 sm:mb-8">Checkout</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">

        <div className="space-y-6">
          {/* ── Shipping ── */}
          <div className="rounded-lg bg-white p-4 shadow-md sm:p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Information</h2>
            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="John Doe"
                  className={`w-full rounded-lg border px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:py-2 ${errors.name?'border-red-500':'border-gray-300'}`} />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="john@example.com"
                  className={`w-full rounded-lg border px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:py-2 ${errors.email?'border-red-500':'border-gray-300'}`} />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Shipping Address *</label>
                <textarea id="address" name="address" value={formData.address} onChange={handleInputChange} rows={3} placeholder="123 Main St, City, ZIP"
                  className={`w-full rounded-lg border px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:py-2 ${errors.address?'border-red-500':'border-gray-300'}`} />
                {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
              </div>
            </form>
          </div>

          {/* ── Payment ── */}
          <div className="rounded-lg bg-white p-4 shadow-md sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Payment Information</h2>
              {cardType && <span className="ml-auto rounded-full bg-blue-50 px-3 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">{cardType}</span>}
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="cardHolder" className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name *</label>
                <input type="text" id="cardHolder" name="cardHolder" value={formData.cardHolder} onChange={handleInputChange} placeholder="John Doe"
                  className={`w-full rounded-lg border px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:py-2 ${errors.cardHolder?'border-red-500':'border-gray-300'}`} />
                {errors.cardHolder && <p className="mt-1 text-sm text-red-600">{errors.cardHolder}</p>}
              </div>
              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">Card Number *</label>
                <input type="text" id="cardNumber" name="cardNumber" value={formData.cardNumber} onChange={handleInputChange}
                  placeholder="1234 5678 9012 3456" maxLength={19} inputMode="numeric"
                  className={`w-full rounded-lg border px-4 py-3 tracking-widest font-mono focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:py-2 ${errors.cardNumber?'border-red-500':'border-gray-300'}`} />
                {errors.cardNumber && <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expiry" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
                  <input type="text" id="expiry" name="expiry" value={formData.expiry} onChange={handleInputChange}
                    placeholder="MM/YY" maxLength={5} inputMode="numeric"
                    className={`w-full rounded-lg border px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:py-2 ${errors.expiry?'border-red-500':'border-gray-300'}`} />
                  {errors.expiry && <p className="mt-1 text-sm text-red-600">{errors.expiry}</p>}
                </div>
                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">CVV *</label>
                  <input type="password" id="cvv" name="cvv" value={formData.cvv} onChange={handleInputChange}
                    placeholder="•••" maxLength={4} inputMode="numeric"
                    className={`w-full rounded-lg border px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:py-2 ${errors.cvv?'border-red-500':'border-gray-300'}`} />
                  {errors.cvv && <p className="mt-1 text-sm text-red-600">{errors.cvv}</p>}
                </div>
              </div>
              <p className="text-xs text-gray-400">🔒 This is a demo — no real charges are made.</p>
            </div>
          </div>

          {errors.form && <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{errors.form}</p>}
          <button type="submit" form="checkout-form" disabled={submitting}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-60 disabled:cursor-not-allowed">
            {submitting ? 'Placing Order…' : 'Place Order'}
          </button>
        </div>

        {/* ── Order Summary ── */}
        <div>
          <div className="rounded-lg bg-white p-4 shadow-md sm:p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {cart.map(item => (
                <div key={`${item.id}-${item.size || 'Standard'}`} className="flex items-start gap-3 sm:items-center sm:gap-4">
                  <img src={item.image} alt={item.name} className="h-16 w-16 shrink-0 rounded object-cover" />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                      {item.size && item.size !== 'Standard' ? ` · Size: ${item.size}` : ''}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold text-gray-900">${(item.price*item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-semibold">${getCartTotal().toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span className="font-semibold text-green-600">Free</span></div>
              <div className="border-t pt-2 flex justify-between"><span className="text-lg font-bold">Total</span><span className="text-lg font-bold text-blue-600">${getCartTotal().toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};