'use server';

import { auth } from '@/auth';

const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4050/api/v1';

/**
 * Error response type
 */
export interface ApiError {
    status?: number;
    message: string;
    type?: 'timeout' | 'network' | 'validation' | 'unknown';
    details?: unknown;
}

/**
 * Generic server-side request handler with error handling
 * Supports all HTTP methods and automatic token management
 */
export async function handleRequest<T>(
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
    urlPath: string,
    data?: unknown,
    withToken: boolean = true,
    isFormData: boolean = false,
    timeoutMs: number = 30000, // Default timeout 30 seconds
): Promise<{ data?: T; error?: ApiError }> {
    try {
        // Dev helper: optional mock responses when backend is unavailable
        if (
            process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' &&
            process.env.NODE_ENV !== 'production'
        ) {
            const normalized = urlPath.startsWith('/')
                ? urlPath.slice(1)
                : urlPath;
            // Mock login endpoint
            if (method === 'POST' && normalized === 'auth/login') {
                const now = new Date();
                const mock: any = {
                    user: {
                        id: 'dev-user-1',
                        email: (data as any)?.email || 'dev.user@example.com',
                        name: 'Dev User',
                        role: 'user',
                        createdAt: now.toISOString(),
                        updatedAt: now.toISOString(),
                    },
                    accessToken: 'dev-access-token',
                    refreshToken: 'dev-refresh-token',
                };
                return { data: mock as T };
            }
        }

        // Setup request configuration
        const config: RequestInit = {
            method,
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, private',
            } as HeadersInit,
        };

        // Add token if required
        if (withToken) {
            const session = await auth();
            if (session?.user?.accessToken) {
                config.headers = {
                    ...config.headers,
                    Authorization: `Bearer ${session.user.accessToken}`,
                };
            }
        }

        // Handle request body based on data type
        if (data) {
            if (isFormData) {
                // For FormData, don't set Content-Type (browser will set it with boundary)
                config.body = data as BodyInit;
            } else if (method !== 'GET') {
                // For JSON data
                config.headers = {
                    ...config.headers,
                    'Content-Type': 'application/json',
                };
                config.body = JSON.stringify(data);
            }
        }

        // Build full URL
        const url = urlPath.startsWith('http')
            ? urlPath
            : `${API_BASE}${urlPath.startsWith('/') ? urlPath : `/${urlPath}`}`;

        // Make the request with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs); // Timeout configurable

        const response = await fetch(url, {
            ...config,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle response
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({
                message: `HTTP Error: ${response.status} ${response.statusText}`,
            }));

            return {
                error: {
                    status: response.status,
                    message:
                        errorData.message ||
                        errorData.error ||
                        'Request failed',
                    details: errorData,
                },
            };
        }

        // Parse successful response
        const responseData = await response.json().catch(() => null);

        return {
            data: responseData?.data || responseData,
        };
    } catch (error) {
        // Handle different error types
        const err = error as Error;

        if (err.name === 'AbortError') {
            return {
                error: {
                    message:
                        'Request timeout - server is taking too long to respond',
                    type: 'timeout',
                },
            };
        }

        if (err.message?.includes('fetch')) {
            return {
                error: {
                    message:
                        'Unable to connect to server. Please check your connection.',
                    type: 'network',
                },
            };
        }

        return {
            error: {
                message: err.message || 'An unexpected error occurred',
                type: 'unknown',
                details: error,
            },
        };
    }
}
