import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut, LogIn, Settings, Users, Plus, ChevronDown } from 'lucide-react';

const Shell = () => {
    const { user, isAdmin, logout } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-white border-b border-[var(--color-border)] h-16 flex items-center px-6 sticky top-0 z-50">
                <div className="container flex items-center justify-between h-full">
                    <Link to="/dashboard" className="flex items-center gap-2">
                        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="EMG Logo" className="h-8 w-auto object-contain" />
                    </Link>

                    <div className="flex items-center gap-4">
                        {isAdmin && (
                            <nav className="hidden sm:flex items-center gap-1">
                                <Link to="/admin/users" className="text-xs font-medium text-gray-500 hover:text-[var(--color-brand-primary)] px-2.5 py-1.5 rounded hover:bg-gray-100 transition-colors flex items-center gap-1">
                                    <Users size={14} /> Users
                                </Link>
                                <Link to="/admin/projects/new" className="text-xs font-medium text-gray-500 hover:text-[var(--color-brand-primary)] px-2.5 py-1.5 rounded hover:bg-gray-100 transition-colors flex items-center gap-1">
                                    <Plus size={14} /> New Project
                                </Link>
                            </nav>
                        )}

                        {isAdmin && <span className="bg-slate-800 text-white text-xs font-medium px-2.5 py-1 rounded">Admin</span>}

                        {user ? (
                            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
                                >
                                    <div className="text-right hidden sm:block">
                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                        <div className="text-xs text-gray-500">{user.email}</div>
                                    </div>
                                    <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                                        <User size={18} />
                                    </div>
                                    <ChevronDown size={14} className="text-gray-400 hidden sm:block" />
                                </button>

                                {showDropdown && (
                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden z-50">
                                        <div className="px-4 py-3 border-b border-gray-100 sm:hidden">
                                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                            <div className="text-xs text-gray-500">{user.email}</div>
                                        </div>
                                        <Link
                                            to="/settings"
                                            onClick={() => setShowDropdown(false)}
                                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <Settings size={14} /> Settings
                                        </Link>
                                        {isAdmin && (
                                            <Link
                                                to="/admin/users"
                                                onClick={() => setShowDropdown(false)}
                                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors sm:hidden"
                                            >
                                                <Users size={14} /> User Management
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => { setShowDropdown(false); logout(); }}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                                        >
                                            <LogOut size={14} /> Log Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="flex items-center gap-2 text-sm font-medium text-[var(--color-brand-primary)] hover:text-blue-700 transition-colors"
                            >
                                <span className="hidden sm:inline">Log In</span>
                                <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                                    <LogIn size={18} />
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </header>
            <main className="flex-1 py-8">
                <Outlet />
            </main>
            <footer className="h-12 border-t border-[var(--color-border)] bg-white flex items-center justify-center text-sm text-[var(--color-text-secondary)]">
                &copy; {new Date().getFullYear()} EMG Project Management. All rights reserved.
            </footer>
        </div>
    );
};

export default Shell;
