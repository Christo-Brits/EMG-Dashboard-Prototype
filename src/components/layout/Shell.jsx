import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useProjectData } from '../../context/ProjectContext';
import { User, LogOut, LogIn, Shield, Settings, Bell, Circle, HelpCircle, CheckCircle2 } from 'lucide-react';

const Shell = () => {
    const { user, isAdmin, logout } = useAuth();
    const { actions, qa, updates, activeProjectId } = useProjectData();
    const navigate = useNavigate();
    const [showNotifications, setShowNotifications] = useState(false);
    const notifRef = useRef(null);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    // Close notifications on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const openActions = actions.filter(a => a.status === 'Open');
    const openQuestions = qa.filter(q => q.status === 'Open');
    const notifCount = openActions.length + openQuestions.length;

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-white border-b border-[var(--color-border)] h-16 flex items-center px-4 sm:px-6 sticky top-0 z-50 print:hidden">
                <div className="container flex items-center justify-between h-full">
                    <Link to="/dashboard" className="flex items-center gap-2">
                        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="EMG Logo" className="h-8 w-auto object-contain" />
                    </Link>
                    <div className="flex items-center gap-2 sm:gap-4">
                        {user && (
                            <span className={`text-xs font-medium px-2.5 py-1 rounded flex items-center gap-1 hidden sm:flex ${isAdmin ? 'bg-slate-800 text-white' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                                {isAdmin ? <><Shield size={12} /> Admin</> : 'User'}
                            </span>
                        )}

                        {/* Notification Bell */}
                        {user && activeProjectId && (
                            <div className="relative" ref={notifRef}>
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className="p-2 text-gray-400 hover:text-[var(--color-brand-primary)] transition-colors relative"
                                    title="Notifications"
                                >
                                    <Bell size={18} />
                                    {notifCount > 0 && (
                                        <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] min-h-[18px] rounded-full flex items-center justify-center leading-none">
                                            {notifCount > 9 ? '9+' : notifCount}
                                        </span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                                            <h3 className="text-sm font-semibold text-gray-700">Open Items</h3>
                                        </div>
                                        <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                                            {notifCount === 0 ? (
                                                <div className="px-4 py-8 text-center">
                                                    <CheckCircle2 size={24} className="text-green-400 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-500">All caught up!</p>
                                                </div>
                                            ) : (
                                                <>
                                                    {openActions.slice(0, 5).map(action => (
                                                        <div
                                                            key={`action-${action.id}`}
                                                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                                            onClick={() => {
                                                                navigate(`/project/${activeProjectId}/actions`);
                                                                setShowNotifications(false);
                                                            }}
                                                        >
                                                            <div className="flex items-start gap-2">
                                                                <Circle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                                                                <div className="min-w-0">
                                                                    <p className="text-sm text-gray-700 line-clamp-1">{action.task}</p>
                                                                    <p className="text-xs text-gray-400 mt-0.5">Action &bull; Due {action.dueDate}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    {openQuestions.slice(0, 5).map(q => (
                                                        <div
                                                            key={`qa-${q.id}`}
                                                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                                            onClick={() => {
                                                                navigate(`/project/${activeProjectId}/qa`);
                                                                setShowNotifications(false);
                                                            }}
                                                        >
                                                            <div className="flex items-start gap-2">
                                                                <HelpCircle size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                                                                <div className="min-w-0">
                                                                    <p className="text-sm text-gray-700 line-clamp-1">{q.title}</p>
                                                                    <p className="text-xs text-gray-400 mt-0.5">Question &bull; {q.date}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </>
                                            )}
                                        </div>
                                        {notifCount > 0 && (
                                            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-center">
                                                <span className="text-xs text-gray-400">{notifCount} open item{notifCount !== 1 ? 's' : ''} in current project</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {isAdmin && (
                            <Link
                                to="/admin"
                                className="p-2 text-gray-400 hover:text-[var(--color-brand-primary)] transition-colors"
                                title="User Management"
                            >
                                <Settings size={18} />
                            </Link>
                        )}

                        {user ? (
                            <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-gray-200">
                                <div className="text-right hidden sm:block">
                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                    <div className="text-xs text-gray-500">{user.email}</div>
                                </div>
                                <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                                    <User size={18} />
                                </div>
                                <button
                                    onClick={handleLogout}
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
            <footer className="h-12 border-t border-[var(--color-border)] bg-white flex items-center justify-center text-sm text-[var(--color-text-secondary)] print:hidden">
                &copy; 2026 EMG Project Management. All rights reserved.
            </footer>
        </div>
    );
};

export default Shell;
