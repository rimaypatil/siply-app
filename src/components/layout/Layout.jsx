import { Outlet, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, History, Settings, PlusCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { InstallPrompt } from '../features/InstallPrompt';
import HydrationBuddy from '../features/HydrationBuddy';


export default function Layout() {
    const location = useLocation();
    const path = location.pathname;

    // We hide nav on Welcome/Setup pages usually, but let's check path
    const hideNav = ['/', '/setup'].includes(path) || path === '/welcome';

    return (
        <div className="min-h-screen bg-slate-50 flex justify-center">
            {/* Mobile container - max-width for desktop view to simulate mobile app */}
            {/* Mobile container - max-width for desktop view to simulate mobile app */}
            <div className="w-full max-w-md bg-slate-50 min-h-screen relative shadow-2xl overflow-hidden flex flex-col">
                <InstallPrompt />
                <HydrationBuddy />
                <main className="flex-1 overflow-y-auto pb-24">
                    <Outlet />
                </main>

                {!hideNav && (
                    <nav className="absolute bottom-6 left-4 right-4 bg-white/90 backdrop-blur-lg border border-white/20 shadow-xl shadow-slate-200/50 rounded-2xl h-16 flex items-center justify-around px-2 z-50">
                        <Link to="/dashboard" className={clsx('p-3 rounded-xl transition-all', path === '/dashboard' ? 'text-brand-600 bg-brand-50' : 'text-slate-400 hover:text-brand-500')}>
                            <LayoutDashboard size={24} />
                        </Link>

                        <Link to="/dashboard" className="mb-8">
                            {/* Floating Action Button (Visual only here, function is on Dashboard) - actually sticking to nav items */}
                            <div className="bg-brand-500 text-white p-3 rounded-full shadow-lg shadow-brand-500/30 transform transition-transform active:scale-95">
                                <PlusCircle size={28} />
                            </div>
                        </Link>

                        <Link to="/history" className={clsx('p-3 rounded-xl transition-all', path === '/history' ? 'text-brand-600 bg-brand-50' : 'text-slate-400 hover:text-brand-500')}>
                            <History size={24} />
                        </Link>

                        <Link to="/settings" className={clsx('p-3 rounded-xl transition-all', path === '/settings' ? 'text-brand-600 bg-brand-50' : 'text-slate-400 hover:text-brand-500')}>
                            <Settings size={24} />
                        </Link>
                    </nav>
                )}
            </div>
        </div>
    );
}
