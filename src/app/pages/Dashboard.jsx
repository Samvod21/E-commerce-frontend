import { useEffect, useState } from 'react';
import { PlusSquare, Upload, CheckCircle, Trash2 } from 'lucide-react';
import {
    getPersistedProducts,
} from '../utils/cache';


const API_BASE = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api/products', '')
    : 'http://localhost:5000';



const DEFAULT_CATEGORIES = ['Electronics', 'Clothing', 'Sports', 'Home', 'Beauty', 'Toys', 'Accessories', 'Other'];
const initialState = {
    name: '',
    price: '',
    category: '',
    description: '',
    stock: '',
    imageFile: null
};

// Reads the logged-in user (including masked payoutInfo, for sellers) from
// localStorage — same shape that Signup/Login store after auth.
const getCurrentUser = () => {
    try {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const Dashboard = () => {
    const [formData, setFormData] = useState(initialState);
    // `sizes` now holds { size, price } objects instead of plain strings, so
    // each size the seller adds can have its own price.
    const [sizes, setSizes] = useState([]);
    const [sizeInput, setSizeInput] = useState('');
    const [sizePriceInput, setSizePriceInput] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState('');
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('create'); // create | manage | orders
    const [persistedProducts, setPersistedProducts] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [orders, setOrders] = useState([]);


    useEffect(() => {
        if (activeTab === 'orders') {
            refreshOrders();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }

        setFormData((prev) => ({ ...prev, imageFile: file }));
        const reader = new FileReader();
        reader.onload = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleAddSize = () => {
        const value = sizeInput.trim();
        const priceValue = Number(sizePriceInput);

        // A size needs a name AND a valid price greater than 0 — this is what
        // lets the buyer pick a size and pay the right amount for it.
        if (!value || !sizePriceInput || Number.isNaN(priceValue) || priceValue <= 0) {
            setErrors((prev) => ({ ...prev, sizeInput: 'Enter a size and a valid price greater than 0' }));
            return;
        }

        if (sizes.some((s) => s.size === value)) {
            setSizeInput('');
            setSizePriceInput('');
            return;
        }

        setSizes((prev) => [...prev, { size: value, price: priceValue }]);
        setSizeInput('');
        setSizePriceInput('');
        setErrors((prev) => ({ ...prev, sizeInput: '' }));
    };

    const handleSizeKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddSize();
        }
    };

    const removeSize = (sizeToRemove) => {
        setSizes((prev) => prev.filter((s) => s.size !== sizeToRemove));
    };

    const validate = () => {
        const nextErrors = {};

        if (!formData.name.trim()) {
            nextErrors.name = 'Product name is required';
        }

        // If the seller hasn't added any custom sizes, the top-level Price
        // field is what's used (as an implicit "Standard" size). If they have
        // added sizes, each one needs its own valid price instead.
        if (sizes.length === 0) {
            if (!formData.price.trim() || Number.isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
                nextErrors.price = 'A valid price is required';
            }
        } else if (sizes.some((s) => Number.isNaN(Number(s.price)) || Number(s.price) <= 0)) {
            nextErrors.sizeInput = 'Every size needs a valid price greater than 0';
        }

        if (!formData.category.trim()) {
            nextErrors.category = 'Category is required';
        }

        if (!formData.description.trim()) {
            nextErrors.description = 'Description is required';
        }

        if (!formData.stock.trim() || Number.isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
            nextErrors.stock = 'Stock quantity is required';
        }

        if (!formData.imageFile && !imagePreview) {
            nextErrors.imageFile = 'Product image is required';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const buildProduct = () => {
        // sizesPayload is always an array of { size, price } objects — if the
        // seller didn't add any custom sizes, we fall back to a single
        // "Standard" size using the top-level Price field.
        const sizesPayload = sizes.length ? sizes : [{ size: 'Standard', price: Number(formData.price) }];
        return {
            id: Date.now(),
            // The top-level price is always the cheapest size, so listings can
            // show a single "from $X" figure and sorting/filtering keeps working.
            price: Math.min(...sizesPayload.map((s) => s.price)),
            name: formData.name.trim(),
            category: formData.category.trim(),
            description: formData.description.trim(),
            stock: Number(formData.stock),
            sizes: sizesPayload,
            image: imagePreview
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            return;
        }

        setSaving(true);
        setStatus('');

        const product = buildProduct();
        const formDataToSend = new FormData();

        formDataToSend.append('name', product.name);
        formDataToSend.append('price', product.price.toString());
        formDataToSend.append('category', product.category);
        formDataToSend.append('description', product.description);
        formDataToSend.append('stock', product.stock.toString());
        // Sizes now carry per-size prices, so they're sent as one JSON field
        // rather than several 'sizes[]' string entries.
        formDataToSend.append('sizes', JSON.stringify(product.sizes));
        if (formData.imageFile) {
            formDataToSend.append('image', formData.imageFile);
        }

        const apiUrl = import.meta.env.VITE_API_URL || '/api/products';
        let savedProduct = null;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formDataToSend,
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            if (response.ok) {
                savedProduct = await response.json();
                if (savedProduct && !savedProduct.image) {
                    savedProduct.image = product.image;
                }
            } else {
                const errorText = await response.text();
                console.warn('Dashboard save failed:', response.status, errorText);
                setStatus(`Product save failed (${response.status}).`);
            }
        } catch (error) {
            console.warn('Dashboard save error:', error);
            setStatus('Product save failed (network error).');
        }

        const productToStore = savedProduct || product;

        if (editingId) {
            // Backend update
            try {
                const putForm = new FormData();
                putForm.append('name', productToStore.name);
                putForm.append('price', productToStore.price.toString());
                putForm.append('category', productToStore.category);
                putForm.append('description', productToStore.description);
                putForm.append('stock', productToStore.stock.toString());

                const sizesForUpdate = productToStore.sizes && productToStore.sizes.length
                    ? productToStore.sizes
                    : [{ size: 'Standard', price: productToStore.price }];
                putForm.append('sizes', JSON.stringify(sizesForUpdate));
                if (formData.imageFile) {
                    putForm.append('image', formData.imageFile);
                }

                const apiUrl = import.meta.env.VITE_API_URL || '/api/products';
                const token = localStorage.getItem('token');
                const res = await fetch(`${apiUrl}/${editingId}`, {
                    method: 'PUT',
                    body: putForm,
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });

                if (!res.ok) {
                    const text = await res.text();
                    console.warn('Update failed:', res.status, text);
                    setStatus('Product update failed.');
                    setSaving(false);
                    return;
                }

                setStatus('Product updated successfully.');
                setEditingId(null);
                await fetchProductsFromBackend();
            } catch (e) {
                console.warn('Update error:', e);
                setStatus('Product update failed.');
            }
        } else {
            // Create already attempted above (POST)
            setStatus(savedProduct ? 'Product saved to backend.' : 'Product save attempted (backend may be unavailable).');
            setEditingId(null);
            await fetchProductsFromBackend();
        }


        setFormData(initialState);
        setSizes([]);
        setSizeInput('');
        setSizePriceInput('');
        setImagePreview('');
        setErrors({});
        setSaving(false);
    };

    const startEdit = (product) => {
        setEditingId(product.id);
        // If the product only has the implicit single "Standard" size, treat
        // it as "no custom sizes" so the top-level Price field is used again
        // (matching how a product with no sizes is created).
        const isStandardOnly = product.sizes?.length === 1 && product.sizes[0].size === 'Standard';
        setFormData({
            name: product.name || '',
            price: isStandardOnly
                ? String(product.sizes[0].price)
                : (product.price ? String(product.price) : ''),
            category: product.category || '',
            description: product.description || '',
            stock: product.stock ? String(product.stock) : '',
            imageFile: null
        });
        setSizes(isStandardOnly ? [] : (product.sizes || []).map((s) => ({ size: s.size, price: s.price })));
        setImagePreview(product.image || '');
        setActiveTab('create');
        setStatus('Editing product. Make changes and click Save.');
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this product? This action cannot be undone.')) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/products/${id}`, {
                method: 'DELETE',
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (!res.ok) {
                const text = await res.text();
                console.warn('Delete failed:', text);
                setStatus(`Delete failed (${res.status}).`);
                return;
            }

            setStatus('Product deleted.');
            await fetchProductsFromBackend();
            // If we were editing the deleted product, reset form
            if (editingId === id) {
                setEditingId(null);
                setFormData(initialState);
                setSizes([]);
                setSizeInput('');
                setSizePriceInput('');
                setImagePreview('');
                setErrors({});
            }
        } catch (e) {
            console.warn('Delete error:', e);
            setStatus('Delete failed.');
        }
    };

    const fetchOrdersFromBackend = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setOrders([]);
                return;
            }

            // Identify the current user so we can flag which line items belong to them
            // and send the seller-scoped orders query.
            const currentUserId = (() => {
                try {
                    const raw = localStorage.getItem('user');
                    const parsed = raw ? JSON.parse(raw) : null;
                    return parsed?.id ? String(parsed.id) : '';
                } catch {
                    return '';
                }
            })();
            const currentRole = (() => {
                try {
                    const raw = localStorage.getItem('user');
                    const parsed = raw ? JSON.parse(raw) : null;
                    return parsed?.role || '';
                } catch {
                    return '';
                }
            })();

            const scopeParam = currentRole === 'seller' ? '?scope=seller' : '';
            const res = await fetch(`${API_BASE}/api/orders${scopeParam}`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                setOrders([]);
                return;
            }

            const normalised = (data.orders || []).map((o) => ({
                id: o._id ?? o.id,
                date: o.createdAt ?? o.orderDate ?? o.date,
                total: o.total,
                delivered: o.status === 'delivered',
                customerInfo: o.customerInfo,
                items: (o.items || []).map((it) => ({
                    id: it.product ?? it._id,
                    seller: it.seller ? String(it.seller) : '',
                    name: it.name,
                    price: it.price,
                    quantity: it.quantity,
                    image: it.image,
                    // Mark whether this line item belongs to the currently
                    // logged-in seller (only meaningful when current user is a seller).
                    ownedByMe: currentRole === 'seller' && currentUserId
                        ? String(it.seller || '') === currentUserId
                        : false,
                })),
                status: o.status
            }));

            normalised.sort((a, b) => new Date(b.date) - new Date(a.date));
            setOrders(normalised);
        } catch {
            setOrders([]);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) {
                const text = await res.text();
                console.warn('Status update failed:', res.status, text);
                setStatus(`Status update failed (${res.status}).`);
                return;
            }

            setStatus(`Order marked as ${newStatus}.`);
            await fetchOrdersFromBackend();
        } catch (e) {
            console.warn('Status update error:', e);
            setStatus('Status update failed.');
        }
    };

    const refreshOrders = () => {
        fetchOrdersFromBackend();
    };

    const fetchProductsFromBackend = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/products`);
            const data = await res.json();
            if (!res.ok) {
                setPersistedProducts([]);
                return;
            }

            const list = (Array.isArray(data) ? data : data?.products) || [];

            // Only show products owned by the currently logged-in seller in the dashboard.
            const currentUserId = (() => {
                try {
                    const raw = localStorage.getItem('user');
                    const parsed = raw ? JSON.parse(raw) : null;
                    return parsed?.id ? String(parsed.id) : '';
                } catch {
                    return '';
                }
            })();

            // normalize to {id, ...} and filter to owner's products only
            const normalised = list
                .map((p) => ({
                    ...p,
                    id: String(p.id ?? p._id ?? ''),
                    owner: p.owner ? String(p.owner) : '',
                }))
                .filter((p) => p.id && (!currentUserId || p.owner === currentUserId));

            setPersistedProducts(normalised);
        } catch {
            setPersistedProducts([]);
        }
    };

    useEffect(() => {
        if (activeTab === 'manage') {
            fetchProductsFromBackend();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const toggleDelivered = () => {
        // Delivery toggle is currently local-only in this UI; backend order status updates are not implemented.
        // Keeping this as a no-op to avoid confusing empty dashboard after the storage refactor.
    };

    // Payout account + a simple earnings ledger for the seller. There's no
    // real payment processor wired up (see orderController.js — payment is
    // simulated), so this doesn't move any money; it just tracks what the
    // seller is owed across their orders, the same way the rest of this app
    // simulates payment info without actually charging a card.
    const currentUser = getCurrentUser();
    const sellerEarnings = orders.reduce((sum, order) => {
        const mine = (order.items || []).filter((it) => it.ownedByMe);
        return sum + mine.reduce((s, it) => s + (it.price || 0) * (it.quantity || 1), 0);
    }, 0);

    return (
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
            <div className="mb-6 text-center sm:mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-2">
                    Add new products with full metadata and image upload support.
                </p>
            </div>

            <div className="mb-6 flex flex-col gap-3 rounded-2xl bg-white p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                <div className="grid grid-cols-3 gap-2 sm:flex">
                    <button onClick={() => setActiveTab('create')} className={`rounded-xl px-3 py-2 text-sm sm:px-4 ${activeTab === 'create' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Create</button>
                    <button onClick={() => { setActiveTab('manage'); setPersistedProducts(getPersistedProducts()); }} className={`rounded-xl px-3 py-2 text-sm sm:px-4 ${activeTab === 'manage' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Manage</button>
                    <button onClick={() => { setActiveTab('orders'); refreshOrders(); }} className={`rounded-xl px-3 py-2 text-sm sm:px-4 ${activeTab === 'orders' ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>Orders</button>
                </div>
                <div className="text-sm text-gray-600">Active tab: {activeTab}</div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr] lg:gap-8">
                <div className="rounded-3xl bg-white p-4 shadow-sm sm:p-6">
                    {activeTab === 'create' && (
                        <>
                            <div className="mb-6 flex items-start gap-3 sm:items-center">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                                    <PlusSquare className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">{editingId ? 'Edit Product' : 'Create a Product'}</h2>
                                    <p className="text-sm text-gray-500">Products are pushed to your store inventory and cached for display.</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                                        <input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            className={`w-full rounded-2xl border px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                                            placeholder="Wireless Headphones"
                                        />
                                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                        <select
                                            id="category"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className={`w-full rounded-2xl border px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 ${errors.category ? 'border-red-500' : 'border-gray-200'}`}
                                        >
                                            <option value="">Select category</option>
                                            {DEFAULT_CATEGORIES.map((category) => (
                                                <option key={category} value={category}>
                                                    {category}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                                        <input
                                            id="price"
                                            name="price"
                                            type="number"
                                            step="0.01"
                                            value={formData.price}
                                            onChange={handleChange}
                                            className={`w-full rounded-2xl border px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 ${errors.price ? 'border-red-500' : 'border-gray-200'}`}
                                            placeholder="79.99"
                                        />
                                        {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                                        <input
                                            id="stock"
                                            name="stock"
                                            type="number"
                                            value={formData.stock}
                                            onChange={handleChange}
                                            className={`w-full rounded-2xl border px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 ${errors.stock ? 'border-red-500' : 'border-gray-200'}`}
                                            placeholder="15"
                                        />
                                        {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        rows={4}
                                        value={formData.description}
                                        onChange={handleChange}
                                        className={`w-full rounded-2xl border px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 ${errors.description ? 'border-red-500' : 'border-gray-200'}`}
                                        placeholder="Enter product description"
                                    />
                                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                                </div>

                                <div>
                                    <label htmlFor="sizeInput" className="block text-sm font-medium text-gray-700 mb-2">Sizes &amp; Prices</label>
                                    <p className="mb-2 text-xs text-gray-500">
                                        If this product comes in more than one size, add each size with its own price below —
                                        the buyer will pick a size and pay that size's price. Leave this empty to use the single Price field above.
                                    </p>
                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <input
                                            id="sizeInput"
                                            type="text"
                                            value={sizeInput}
                                            onKeyDown={handleSizeKeyDown}
                                            onChange={(e) => setSizeInput(e.target.value)}
                                            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                            placeholder="Size, e.g. M, L, 500ml"
                                        />
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={sizePriceInput}
                                            onKeyDown={handleSizeKeyDown}
                                            onChange={(e) => setSizePriceInput(e.target.value)}
                                            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 sm:w-44"
                                            placeholder="Price for this size"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddSize}
                                            className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                                        >
                                            Add Size
                                        </button>
                                    </div>
                                    {errors.sizeInput && <p className="mt-1 text-sm text-red-600">{errors.sizeInput}</p>}
                                    {sizes.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {sizes.map((s) => (
                                                <span key={s.size} className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
                                                    {s.size} — ${Number(s.price).toFixed(2)}
                                                    <button type="button" onClick={() => removeSize(s.size)} className="rounded-full p-1 text-blue-600 hover:bg-blue-200">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                                    <label className="group relative flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center transition hover:border-blue-500 hover:bg-white">
                                        <div>
                                            <Upload className="mx-auto h-6 w-6 text-blue-600" />
                                            <p className="mt-3 text-sm text-gray-600">Click to upload or drag and drop an image</p>
                                            <p className="text-xs text-gray-400">PNG, JPG, or JPEG formats supported</p>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                                            onChange={handleImageChange}
                                        />
                                    </label>
                                    {errors.imageFile && <p className="mt-2 text-sm text-red-600">{errors.imageFile}</p>}
                                    {imagePreview && (
                                        <img src={imagePreview} alt="Preview" className="mt-4 h-56 w-full rounded-3xl object-cover border border-gray-200" />
                                    )}
                                </div>

                                <div className="rounded-3xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
                                    <p className="font-medium">Note:</p>
                                    <p className="mt-1">If your backend is not available, the product will still be cached locally and appear in the store after refresh.</p>
                                </div>

                                {status && (
                                    <div className="rounded-3xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                                        {status}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                                >
                                    {saving ? 'Saving product...' : 'Save Product'}
                                </button>
                            </form>
                        </>
                    )}
                    {activeTab === 'manage' && (
                        <div>
                            <h2 className="text-lg font-semibold mb-4">Managed Products</h2>
                            {persistedProducts.length === 0 ? (
                                <p className="text-sm text-gray-500">No custom products found. Create one using the Create tab.</p>
                            ) : (
                                <div className="space-y-4">
                                    {persistedProducts.map(p => (
                                        <div key={p.id} className="flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex min-w-0 items-center gap-4">
                                                <img src={p.image} alt={p.name} className="h-16 w-16 shrink-0 rounded-md object-cover" />
                                                <div className="min-w-0">
                                                    <div className="truncate font-semibold">{p.name}</div>
                                                    <div className="text-sm text-gray-500">{p.category} - ${p.price}</div>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                                                <button onClick={() => startEdit(p)} className="rounded-md bg-yellow-100 px-3 py-2 text-yellow-800 sm:py-1">Edit</button>
                                                <button onClick={() => handleDelete(p.id)} className="rounded-md bg-red-100 px-3 py-2 text-red-700 sm:py-1">Delete</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div>
                            {currentUser?.payoutInfo && (
                                <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                                    <h3 className="text-sm font-semibold text-gray-900">Payout Account</h3>
                                    <p className="mt-1 text-sm text-gray-700">
                                        {currentUser.payoutInfo.bankName} •••• {currentUser.payoutInfo.last4}
                                    </p>
                                    <p className="text-sm text-gray-500">{currentUser.payoutInfo.accountHolder}</p>
                                    <div className="mt-3 border-t border-blue-100 pt-3">
                                        <p className="text-xs text-gray-500">Total earnings across your orders</p>
                                        <p className="text-2xl font-bold text-blue-600">${sellerEarnings.toFixed(2)}</p>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-400">
                                        Demo platform — earnings are tracked here but not actually transferred to this account.
                                    </p>
                                </div>
                            )}
                            <h2 className="text-lg font-semibold mb-4">Orders</h2>
                            {orders.length === 0 ? (
                                <p className="text-sm text-gray-500">No orders yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map(order => (
                                        <div key={order.id} className="rounded-xl border p-4">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="min-w-0">
                                                    <div className="break-all font-semibold">Order #{order.id}</div>
                                                    <div className="text-sm text-gray-500">{new Date(order.date).toLocaleString()}</div>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className={`px-2 py-1 rounded ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
                                                    </span>
                                                    <select
                                                        value={order.status || 'pending'}
                                                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                                                        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="processing">Processing</option>
                                                        <option value="shipped">Shipped</option>
                                                        <option value="delivered">Delivered</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {order.customerInfo && (
                                                <div className="mt-3 rounded-md bg-gray-50 p-3 text-sm text-gray-700">
                                                    <div className="font-medium text-gray-900">Shipping to</div>
                                                    <div>{order.customerInfo.name} · {order.customerInfo.email}</div>
                                                    <div className="wrap-break-word">{order.customerInfo.address}</div>
                                                </div>
                                            )}

                                            <div className="mt-3 border-t pt-3">
                                                {order.items && order.items.map(item => (
                                                    <div key={item.id || item.name} className="flex items-center gap-3 py-2">
                                                        <img src={item.image} alt={item.name} className="h-12 w-12 shrink-0 rounded-md object-cover" />
                                                        <div className="min-w-0 flex-1">
                                                            <div className="truncate font-medium">
                                                                {item.name}
                                                                {item.ownedByMe && (
                                                                    <span className="ml-2 inline-flex rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                                                        Yours
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-gray-500">Qty: {item.quantity || 1} - ${item.price}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="rounded-3xl bg-white p-4 shadow-sm sm:p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Preview</h2>
                        <div className="rounded-3xl border border-gray-200 p-3 sm:p-4">
                            <div className="h-56 overflow-hidden rounded-3xl bg-gray-100 sm:h-72">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Product preview" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full items-center justify-center px-4 text-center text-gray-400">Image preview will appear here</div>
                                )}
                            </div>

                            <div className="mt-5 space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="wrap-break-word text-lg font-semibold text-gray-900">{formData.name || 'Product name'}</p>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-sm text-gray-500">Category</p>
                                        <p className="text-gray-900">{formData.category || 'Category'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Price</p>
                                        <p className="text-gray-900">
                                            {sizes.length > 0
                                                ? `From $${Math.min(...sizes.map((s) => Number(s.price) || 0)).toFixed(2)}`
                                                : (formData.price ? `$${Number(formData.price).toFixed(2)}` : '$0.00')}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Stock</p>
                                    <p className="text-gray-900">{formData.stock || '0'} units</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Sizes</p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {sizes.length > 0 ? sizes.map((s) => (
                                            <span key={s.size} className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
                                                {s.size} — ${Number(s.price).toFixed(2)}
                                            </span>
                                        )) : (
                                            <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-500">Standard</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Description</p>
                                    <p className="mt-1 wrap-break-word text-gray-900">{formData.description || 'A short product description will appear here.'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl bg-white p-4 shadow-sm sm:p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">How to use this dashboard</h3>
                        <ul className="space-y-3 text-gray-600">
                            <li className="flex gap-2"><CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-500" /> Add a product name, category, price, stock, description, sizes, and image.</li>
                            <li className="flex gap-2"><CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-500" /> Uploaded images are sent using FormData for backend file handling.</li>
                            <li className="flex gap-2"><CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-500" /> If no backend is available, the product is still stored locally and will display in the catalog.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
