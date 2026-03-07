import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { roleLabel } from '../../utils/permissions';
import { User, LogOut, LogIn, Settings, Users, FolderOpen, PlusCircle, Menu, X } from 'lucide-react';
import NotificationBell from '../common/NotificationBell';

const Shell = () => {
    const { user, isAdmin, logout } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const displayRole = isAdmin ? 'Admin' : (user?.globalRole === 'user' ? null : roleLabel(user?.globalRole));
    const displayName = user?.name || user?.email?.split('@')[0] || 'User';

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-white border-b border-[var(--color-border)] h-14 sm:h-16 flex items-center px-4 sm:px-6 sticky top-0 z-50 shadow-sm">
                <div className="container flex items-center justify-between h-full">
                    {/* Left: Logo + desktop nav */}
                    <div className="flex items-center gap-4">
                        <Link to="/projects" className="flex items-center gap-2 flex-shrink-0">
                            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="EMG Logo" className="h-6 sm:h-8 w-auto object-contain" />
                        </Link>
                        <Link
                            to="/projects"
                            className="hidden md:flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <FolderOpen size={16} />
                            <span>Projects</span>
                        </Link>
                    </div>

                    {/* Desktop nav — hidden on mobile */}
                    <div className="hidden md:flex items-center gap-4">
                        {displayRole && <span className="bg-slate-800 text-white text-xs font-medium px-2.5 py-1 rounded">{displayRole}</span>}

                        {isAdmin && (
                            <>
                                <Link
                                    to="/admin/projects/new"
                                    className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                                    title="Create Project"
                                >
                                    <PlusCircle size={16} />
                                    <span>New Project</span>
                                </Link>
                                <Link
                                    to="/admin/users"
                                    className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                                    title="Manage Users"
                                >
                                    <Users size={16} />
                                    <span>Manage Users</span>
                                </Link>
                            </>
                        )}

                        {user && <NotificationBell />}

                        {user ? (
                            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                                <Link to="/settings" className="flex items-center gap-2 hover:opacity-80 transition-opacity" title="Account Settings">
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-gray-900">{displayName}</div>
                                        <div className="text-xs text-gray-500">{user.email}</div>
                                    </div>
                                    <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                                        <User size={18} />
                                    </div>
                                </Link>
                                <button
                                    onClick={logout}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut size={18} />
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="flex items-center gap-2 text-sm font-medium text-[var(--color-brand-primary)] hover:text-blue-700 transition-colors"
                            >
                                <span>Log In</span>
                                <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                                    <LogIn size={18} />
                                </div>
                            </Link>
                        )}
                    </div>

                    {/* Mobile: simplified right side */}
                    <div className="flex md:hidden items-center gap-2">
                        {user && <NotificationBell />}
                        {user ? (
                            <>
                                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 text-xs font-bold">
                                    {displayName.charAt(0).toUpperCase()}
                                </div>
                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="p-2 text-gray-500"
                                    aria-label="Toggle menu"
                                >
                                    {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                                </button>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="flex items-center gap-2 text-sm font-medium text-[var(--color-brand-primary)]"
                            >
                                <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100">
                                    <LogIn size={16} />
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* Mobile menu dropdown */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-b border-gray-200 shadow-lg animate-in slide-in-from-top-2 duration-200 sticky top-14 z-40">
                    <div className="container py-3 space-y-1">
                        <Link to="/projects" onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                            <FolderOpen size={18} /> Projects
                        </Link>
                        {isAdmin && (
                            <>
                                <Link to="/admin/projects/new" onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                                    <PlusCircle size={18} /> New Project
                                </Link>
                                <Link to="/admin/users" onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                                    <Users size={18} /> Manage Users
                                </Link>
                            </>
                        )}
                        <Link to="/settings" onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                            <Settings size={18} /> Settings
                        </Link>
                        <div className="border-t border-gray-100 mt-2 pt-2">
                            <button onClick={() => { logout(); setMobileMenuOpen(false); }}
                                className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg w-full">
                                <LogOut size={18} /> Sign Out
                            </button>
                        </div>
                        <div className="px-4 py-2 text-xs text-gray-400">
                            {user?.email}
                        </div>
                    </div>
                </div>
            )}

            <main className="flex-1 py-4 sm:py-8">
                <Outlet />
            </main>
            <footer className="h-10 sm:h-12 border-t border-[var(--color-border)] bg-white flex items-center justify-center text-xs sm:text-sm text-[var(--color-text-secondary)] px-4">
                &copy; {new Date().getFullYear()} Ethyl Merc Group Ltd. All rights reserved.
            </footer>
        </div>
    );
};

export default Shell;
