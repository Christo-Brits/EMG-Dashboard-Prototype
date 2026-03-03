import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

const ICONS = {
    success: <CheckCircle2 size={18} className="text-green-500" />,
    error: <XCircle size={18} className="text-red-500" />,
    warning: <AlertTriangle size={18} className="text-amber-500" />,
    info: <Info size={18} className="text-blue-500" />,
};

const STYLES = {
    success: 'border-green-200 bg-green-50',
    error: 'border-red-200 bg-red-50',
    warning: 'border-amber-200 bg-amber-50',
    info: 'border-blue-200 bg-blue-50',
};

const Toast = ({ toast, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => onDismiss(toast.id), toast.duration || 4000);
        return () => clearTimeout(timer);
    }, [toast, onDismiss]);

    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg max-w-sm w-full animate-in slide-in-from-right duration-300 ${STYLES[toast.type] || STYLES.info}`}>
            {ICONS[toast.type] || ICONS.info}
            <p className="text-sm font-medium text-gray-800 flex-1">{toast.message}</p>
            <button onClick={() => onDismiss(toast.id)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                <X size={14} />
            </button>
        </div>
    );
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type, duration }]);
    }, []);

    const dismissToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = {
        success: (msg) => addToast(msg, 'success'),
        error: (msg) => addToast(msg, 'error'),
        warning: (msg) => addToast(msg, 'warning'),
        info: (msg) => addToast(msg, 'info'),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className="pointer-events-auto">
                        <Toast toast={t} onDismiss={dismissToast} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
