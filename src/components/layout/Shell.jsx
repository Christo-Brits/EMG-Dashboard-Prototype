import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut } from 'lucide-react';

const Shell = () => {
    const { user, isAdmin, logout } = useAuth();

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-white border-b border-[var(--color-border)] h-16 flex items-center px-6 sticky top-0 z-50">
                <div className="container flex items-center justify-between h-full">
                    <Link to="/dashboard" className="flex items-center gap-2">
                        <img src="/logo.png" alt="EMG Logo" className="h-8 w-auto object-contain" />
                    </Link>
                    <div className="flex items-center gap-4">
                        {isAdmin && <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded border border-indigo-200 uppercase tracking-wide">Admin Mode</span>}

                        {user ? (
                            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                                <div className="text-right hidden sm:block">
                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                    <div className="text-xs text-gray-500">{user.email}</div>
                                </div>
                                <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                                    <User size={18} />
                                </div>
                                <button
                                    onClick={logout}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-200" />
                        )}
                    </div>
                </div>
            </header>
            <main className="flex-1 py-8">
                <Outlet />
            </main>
            <footer className="h-12 border-t border-[var(--color-border)] bg-white flex items-center justify-center text-sm text-[var(--color-text-secondary)]">
                &copy; 2025 EMG. Early Access Preview.
            </footer>
        </div>
    );
};

export default Shell;
