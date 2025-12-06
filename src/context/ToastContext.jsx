import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        const toast = { id, message, type, duration };

        setToasts(prev => [...prev, toast]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const success = useCallback((message, duration) => {
        return addToast(message, 'success', duration);
    }, [addToast]);

    const error = useCallback((message, duration) => {
        return addToast(message, 'error', duration);
    }, [addToast]);

    const warning = useCallback((message, duration) => {
        return addToast(message, 'warning', duration);
    }, [addToast]);

    const info = useCallback((message, duration) => {
        return addToast(message, 'info', duration);
    }, [addToast]);

    return (
        <ToastContext.Provider value={{ success, error, warning, info, addToast, removeToast }}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

function ToastContainer({ toasts, removeToast }) {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
            ))}
        </div>
    );
}

function Toast({ toast, onClose }) {
    const { type, message } = toast;

    const config = {
        success: {
            icon: CheckCircle,
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200',
            iconColor: 'text-green-600',
            textColor: 'text-green-800',
        },
        error: {
            icon: AlertCircle,
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200',
            iconColor: 'text-red-600',
            textColor: 'text-red-800',
        },
        warning: {
            icon: AlertTriangle,
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            iconColor: 'text-yellow-600',
            textColor: 'text-yellow-800',
        },
        info: {
            icon: Info,
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200',
            iconColor: 'text-blue-600',
            textColor: 'text-blue-800',
        },
    };

    const { icon: Icon, bgColor, borderColor, iconColor, textColor } = config[type] || config.info;

    return (
        <div
            className={`${bgColor} ${borderColor} border rounded-lg shadow-lg p-4 flex items-start gap-3 pointer-events-auto animate-fade-in-up`}
            role="alert"
        >
            <Icon className={`h-5 w-5 ${iconColor} flex-shrink-0 mt-0.5`} />
            <p className={`flex-1 text-sm font-medium ${textColor}`}>{message}</p>
            <button
                onClick={onClose}
                className={`${iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
                aria-label="Close notification"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
