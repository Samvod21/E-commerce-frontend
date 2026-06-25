import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api/products', '')
    : 'http://localhost:5000';

export function RequireSeller({ children }) {
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    if (!cancelled) {
                        setRole('anonymous');
                        setLoading(false);
                    }
                    return;
                }

                const res = await fetch(`${API_BASE}/api/auth/me`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await res.json();
                const nextRole = data?.user?.role;

                if (!cancelled) {
                    setRole(nextRole || 'anonymous');
                    setLoading(false);
                }
            } catch {
                if (!cancelled) {
                    setRole('anonymous');
                    setLoading(false);
                }
            }
        };

        run();

        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        // Keep UI minimal; Navbar already renders
        return (
            <div className="mx-auto max-w-7xl px-4 py-10 text-center text-gray-600">
                Loading...
            </div>
        );
    }

    if (role !== 'seller') {
        // Redirect buyers (and anyone else) away from seller dashboard
        return <Navigate to="/" replace />;
    }

    return children;
}

