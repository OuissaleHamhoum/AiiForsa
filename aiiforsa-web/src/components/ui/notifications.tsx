'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/stores/ui.store';

/**
 * Toast notification component
 * Displays notifications from the UI store
 */
export function Notifications() {
    const { notifications, removeNotification } = useUIStore();

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
            {notifications.map(notification => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClose={() => removeNotification(notification.id)}
                />
            ))}
        </div>
    );
}

interface NotificationItemProps {
    notification: {
        id: string;
        type: 'success' | 'error' | 'warning' | 'info';
        message: string;
        duration?: number;
    };
    onClose: () => void;
}

function NotificationItem({ notification, onClose }: NotificationItemProps) {
    useEffect(() => {
        if (notification.duration !== 0) {
            const timer = setTimeout(() => {
                onClose();
            }, notification.duration || 5000);

            return () => clearTimeout(timer);
        }
    }, [notification.duration, onClose]);

    const typeStyles = {
        success:
            'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
        error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
        warning:
            'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
        info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
    };

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
    };

    return (
        <div
            className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-right ${typeStyles[notification.type]}`}
            role="alert"
        >
            <span className="text-lg font-bold">
                {icons[notification.type]}
            </span>
            <p className="flex-1 text-sm font-medium">{notification.message}</p>
            <button
                onClick={onClose}
                className="text-current opacity-70 hover:opacity-100 transition-opacity"
                aria-label="Close notification"
            >
                ✕
            </button>
        </div>
    );
}
