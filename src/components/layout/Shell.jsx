import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { roleLabel } from '../../utils/permissions';
import { User, LogOut, LogIn, Settings, Users, FolderOpen, PlusCircle } from 'lucide-react';
import NotificationBell from '../common/NotificationBell';

const Shell = () => {
    const { user, isAdmin, logout } = useAuth();
    const displayRole = isAdmin ? 'Admin' : (user?.globalRole === 'user' ? null : roleLabel(user?.globalRole));
    const displayName = user?.name || user?.email?.split('@')[0] || 'User';

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-white border-b border-[var(--color-border)] h-16 flex items-center px-6 sticky top-0 z-50">
                <div className="container flex items-center justify-between h-full">
                    <div className="flex items-center gap-4">
                        <Link to="/projects" className="flex items-center gap-2">
                            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="EMG Logo" className="h-8 w-auto object-contain" />
                        </Link>
                        <Link
                            to="/projects"
                            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <FolderOpen size={16} />
                            <span className="hidden sm:inline">Projects</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-4">
                        {displayRole && <span className="bg-slate-800 text-white text-xs font-medium px-2.5 py-1 rounded">{displayRole}</span>}

                        {isAdmin && (
                            <>
                                <Link
                                    to="/admin/projects/new"
                                    className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                                    title="Create Project"
                                >
                                    <PlusCircle size={16} />
                                    <span className="hidden sm:inline">New Project</span>
                                </Link>
                                <Link
                                    to="/admin/users"
                                    className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                                    title="Manage Users"
                                >
                                    <Users size={16} />
                                    <span className="hidden sm:inline">Manage Users</span>
                                </Link>
                            </>
                        )}

                        {user && <NotificationBell />}

                        {user ? (
                            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                                <Link to="/settings" className="flex items-center gap-2 hover:opacity-80 transition-opacity" title="Account Settings">
                                    <div className="text-right hidden sm:block">
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
