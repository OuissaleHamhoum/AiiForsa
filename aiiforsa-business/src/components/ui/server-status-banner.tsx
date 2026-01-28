'use client';

import { checkServerHealth } from '@/actions/server-health';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

/**
 * Server status banner component
 * Displays when backend server is down or unreachable
 */
export function ServerStatusBanner() {
    const [serverStatus, setServerStatus] = useState<{
        isHealthy: boolean;
        message: string;
        isChecking: boolean;
    }>({
        isHealthy: true,
        message: '',
        isChecking: true,
    });

    const checkStatus = async () => {
        setServerStatus(prev => ({ ...prev, isChecking: true }));
        const status = await checkServerHealth();
        setServerStatus({
            isHealthy: status.isHealthy,
            message: status.message,
            isChecking: false,
        });
    };

    useEffect(() => {
        // Check server status on mount
        checkStatus();

        // Check every 30 seconds if server is down
        const interval = setInterval(() => {
            if (!serverStatus.isHealthy) {
                checkStatus();
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [serverStatus.isHealthy]);

    // Don't show anything while checking initially or if server is healthy
    if (serverStatus.isChecking && serverStatus.isHealthy) {
        return null;
    }

    if (serverStatus.isHealthy) {
        return null;
    }

    return (
        // Full-page overlay that covers the entire viewport
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-md">
            <div className="w-full max-w-lg mx-4 animate-in fade-in-0 zoom-in-95 duration-300">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-red-200 dark:border-red-800 overflow-hidden">
                    {/* Header with gradient background */}
                    <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                        <div className="flex items-center justify-center space-x-3">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                    <svg
                                        className="w-6 h-6 text-white"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-white">
                                    Connection Lost
                                </h3>
                                <p className="text-red-100 text-sm">
                                    Unable to reach server
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-6">
                        <div className="text-center space-y-4">
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                {serverStatus.message}
                            </p>

                            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                <span>Attempting to reconnect...</span>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-center">
                            <Button
                                onClick={checkStatus}
                                disabled={serverStatus.isChecking}
                                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {serverStatus.isChecking ? (
                                    <div className="flex items-center space-x-2">
                                        <svg
                                            className="animate-spin w-4 h-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        <span>Checking...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                            />
                                        </svg>
                                        <span>Try Again</span>
                                    </div>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
