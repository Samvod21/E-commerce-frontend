import { Suspense } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const Layout = ({ children }) => (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col overflow-x-hidden">
        <Navbar />
        <main className="flex-1 w-full">
            <Suspense fallback={<div className="mx-auto flex min-h-[40vh] max-w-7xl items-center justify-center px-4 text-sm text-gray-500" role="status">Loading page...</div>}>
                {children}
            </Suspense>
        </main>
        <Footer />
    </div>
);