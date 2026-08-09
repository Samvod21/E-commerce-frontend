import { Link } from 'react-router';
import { Mail, MapPin, Phone, ShieldCheck, Sparkles, Truck } from 'lucide-react';

export const Footer = () => {
    const quickLinks = [
        { label: 'Home', to: '/' },
        { label: 'Cart', to: '/cart' },
        { label: 'Orders', to: '/orders' },
        { label: 'Login', to: '/login' },
    ];

    const supportLinks = [
        { label: 'Shipping', to: '/' },
        { label: 'Returns', to: '/' },
        { label: 'FAQ', to: '/' },
        { label: 'Help Center', to: '/' },
    ];

    const socials = [
        { label: 'Facebook', short: 'f', href: '/' },
        { label: 'Instagram', short: 'ig', href: '/' },
        { label: 'X', short: 'x', href: '/' },
    ];

    return (
        <footer className="mt-16 border-t border-slate-200 bg-slate-950 text-slate-200">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="mb-10 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 shadow-xl shadow-blue-900/20 sm:p-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">Stay in the loop</p>
                            <h3 className="text-2xl font-bold text-white">Get exclusive deals and product drops.</h3>
                        </div>
                        <Link
                            to="/"
                            className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                        >
                            Shop the latest
                            <Sparkles className="ml-2 h-4 w-4" />
                        </Link>
                    </div>
                </div>

                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400">
                                <Truck className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-white">E-Shop</p>
                            </div>
                        </div>
                        <p className="text-sm leading-6 text-slate-300">
                            Curated everyday essentials, premium products, and fast delivery for a smoother shopping experience.
                        </p>
                        <div className="flex items-center gap-3">
                            {socials.map(({ label, short, href }) => (
                                <Link
                                    key={label}
                                    to={href}
                                    aria-label={label}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-xs font-bold text-slate-200 transition hover:border-blue-500 hover:text-blue-400"
                                >
                                    {short}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Quick links</h4>
                        <ul className="space-y-3 text-sm text-slate-300">
                            {quickLinks.map(({ label, to }) => (
                                <li key={label}>
                                    <Link to={to} className="transition hover:text-white">
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Customer care</h4>
                        <ul className="space-y-3 text-sm text-slate-300">
                            {supportLinks.map(({ label, to }) => (
                                <li key={label}>
                                    <Link to={to} className="transition hover:text-white">
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Contact us</h4>
                        <ul className="space-y-4 text-sm text-slate-300">
                            <li className="flex items-start gap-3">
                                <MapPin className="mt-0.5 h-4 w-4 text-blue-400" />
                                <span>123 Market Street, New York, NY</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-blue-400" />
                                <span>+1 (800) 555-0148</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-blue-400" />
                                <span>hello@eshop.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-10 border-t border-slate-800 pt-6 text-sm text-slate-400">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 text-slate-300">
                            <ShieldCheck className="h-4 w-4 text-emerald-400" />
                            <span>Secure checkout • Trusted shipping</span>
                        </div>
                        <p>© 2026 E-Shop. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};
