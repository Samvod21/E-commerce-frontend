import { useState } from 'react';
import { PlusSquare, Upload, CheckCircle, Trash2 } from 'lucide-react';
import { addProductToCache } from '../utils/cache';

const DEFAULT_CATEGORIES = ['Electronics', 'Sports', 'Home', 'Beauty', 'Toys', 'Accessories', 'Other'];
const initialState = {
    name: '',
    price: '',
    category: '',
    description: '',
    stock: '',
    imageFile: null
};

export const Dashboard = () => {
    const [formData, setFormData] = useState(initialState);
    const [sizes, setSizes] = useState([]);
    const [sizeInput, setSizeInput] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const [errors, setErrors] = useState({});
    const [status, setStatus] = useState('');
    const [saving, setSaving] = useState(false);

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
        if (!value) {
            return;
        }
        if (sizes.includes(value)) {
            setSizeInput('');
            return;
        }

        setSizes((prev) => [...prev, value]);
        setSizeInput('');
    };

    const handleSizeKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddSize();
        }
    };

    const removeSize = (sizeToRemove) => {
        setSizes((prev) => prev.filter((size) => size !== sizeToRemove));
    };

    const validate = () => {
        const nextErrors = {};

        if (!formData.name.trim()) {
            nextErrors.name = 'Product name is required';
        }

        if (!formData.price.trim() || Number.isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
            nextErrors.price = 'A valid price is required';
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

    const buildProduct = () => ({
        id: Date.now(),
        name: formData.name.trim(),
        price: Number(formData.price),
        category: formData.category.trim(),
        description: formData.description.trim(),
        stock: Number(formData.stock),
        sizes: sizes.length ? sizes : ['Standard'],
        image: imagePreview
    });

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
        product.sizes.forEach((size) => formDataToSend.append('sizes[]', size));
        if (formData.imageFile) {
            formDataToSend.append('image', formData.imageFile);
        }

        const apiUrl = import.meta.env.VITE_API_URL || '/api/products';
        let savedProduct = null;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formDataToSend
            });

            if (response.ok) {
                savedProduct = await response.json();
                if (savedProduct && !savedProduct.image) {
                    savedProduct.image = product.image;
                }
            } else {
                const errorText = await response.text();
                console.warn('Dashboard save failed:', response.status, errorText);
            }
        } catch (error) {
            console.warn('Dashboard save error:', error);
        }

        const productToStore = savedProduct || product;
        addProductToCache(productToStore);

        setStatus(savedProduct ? 'Product saved to backend and cache.' : 'Product saved locally. Backend endpoint unavailable.');
        setFormData(initialState);
        setSizes([]);
        setSizeInput('');
        setImagePreview('');
        setErrors({});
        setSaving(false);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-2">
                    Add new products with full metadata and image upload support.
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.8fr_1fr]">
                <div className="bg-white rounded-3xl shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                            <PlusSquare className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Create a Product</h2>
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
                            <label htmlFor="sizeInput" className="block text-sm font-medium text-gray-700 mb-2">Sizes</label>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <input
                                    id="sizeInput"
                                    type="text"
                                    value={sizeInput}
                                    onKeyDown={handleSizeKeyDown}
                                    onChange={(e) => setSizeInput(e.target.value)}
                                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    placeholder="Add a size like M, L, 500ml"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddSize}
                                    className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                                >
                                    Add Size
                                </button>
                            </div>
                            {sizes.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {sizes.map((size) => (
                                        <span key={size} className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
                                            {size}
                                            <button type="button" onClick={() => removeSize(size)} className="rounded-full p-1 text-blue-600 hover:bg-blue-200">
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
                </div>

                <div className="space-y-6">
                    <div className="bg-white rounded-3xl shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Preview</h2>
                        <div className="rounded-3xl border border-gray-200 p-4">
                            <div className="h-72 overflow-hidden rounded-3xl bg-gray-100">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Product preview" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-gray-400">Image preview will appear here</div>
                                )}
                            </div>

                            <div className="mt-5 space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Name</p>
                                    <p className="text-lg font-semibold text-gray-900">{formData.name || 'Product name'}</p>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-sm text-gray-500">Category</p>
                                        <p className="text-gray-900">{formData.category || 'Category'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Price</p>
                                        <p className="text-gray-900">{formData.price ? `$${Number(formData.price).toFixed(2)}` : '$0.00'}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Stock</p>
                                    <p className="text-gray-900">{formData.stock || '0'} units</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Sizes</p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {sizes.length > 0 ? sizes.map((size) => (
                                            <span key={size} className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
                                                {size}
                                            </span>
                                        )) : (
                                            <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-500">Standard</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Description</p>
                                    <p className="mt-1 text-gray-900">{formData.description || 'A short product description will appear here.'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">How to use this dashboard</h3>
                        <ul className="space-y-3 text-gray-600">
                            <li className="flex gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> Add a product name, category, price, stock, description, sizes, and image.</li>
                            <li className="flex gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> Uploaded images are sent using FormData for backend file handling.</li>
                            <li className="flex gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> If no backend is available, the product is still stored locally and will display in the catalog.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
