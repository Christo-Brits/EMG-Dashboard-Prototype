import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, FileText, Image, MessageSquare, AlertCircle, ClipboardList, RefreshCw } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const ICON_MAP = {
    update: RefreshCw,
    photo_upload: Image,
    document_upload: FileText,
    action_assigned: ClipboardList,
    qa_question: MessageSquare,
    qa_answer: MessageSquare,
    access_approved: Check,
};

function timeAgo(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

const NotificationBell = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    const handleNotificationClick = (notification) => {
        if (!notification.read) markAsRead(notification.id);
        if (notification.link) navigate(notification.link);
        setOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Notifications"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                                <CheckCheck size={14} /> Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notification list */}
                    <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-50">
                        {notifications.length === 0 ? (
                            <div className="py-12 text-center text-gray-400">
                                <Bell size={24} className="mx-auto mb-2 opacity-40" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((n) => {
                                const Icon = ICON_MAP[n.type] || AlertCircle;
                                return (
                                    <button
                                        key={n.id}
                                        onClick={() => handleNotificationClick(n)}
                                        className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-gray-50 transition-colors ${
                                            !n.read ? 'bg-blue-50/50' : ''
                                        }`}
                                    >
                                        <div className={`mt-0.5 flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                                            !n.read ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                            <Icon size={14} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm leading-snug ${!n.read ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                                                {n.message}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-gray-400">{timeAgo(n.createdAt)}</span>
                                                {n.projectName && (
                                                    <span className="text-xs text-gray-400">· {n.projectName}</span>
                                                )}
                                            </div>
                                        </div>
                                        {!n.read && (
                                            <div className="flex-shrink-0 mt-2 h-2 w-2 rounded-full bg-blue-500" />
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
