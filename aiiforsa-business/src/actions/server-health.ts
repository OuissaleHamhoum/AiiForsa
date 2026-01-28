'use server';

import { cookies } from 'next/headers';

/**
 * Server action to check if the backend API is reachable
 */
export async function checkServerHealth(): Promise<{
    isHealthy: boolean;
    message: string;
    timestamp?: string;
}> {
    try {
        const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4050/api/v1';
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(`${apiUrl}/health`, {
            method: 'GET',
            signal: controller.signal,
            cache: 'no-store',
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            return {
                isHealthy: true,
                message: 'Server is running',
                timestamp: data.timestamp,
            };
        }

        return {
            isHealthy: false,
            message: `Server returned status: ${response.status}`,
        };
    } catch (error) {
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                return {
                    isHealthy: false,
                    message: 'Server is not responding (timeout)',
                };
            }
            return {
                isHealthy: false,
                message: `Server connection failed: ${error.message}`,
            };
        }
        return {
            isHealthy: false,
            message: 'Server is down or unreachable',
        };
    }
}

/**
 * Server action to get the current authentication status
 */
export async function getAuthStatus(): Promise<{
    isAuthenticated: boolean;
    hasToken: boolean;
}> {
    try {
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get('next-auth.session-token');

        return {
            isAuthenticated: !!sessionToken,
            hasToken: !!sessionToken,
        };
    } catch {
        return {
            isAuthenticated: false,
            hasToken: false,
        };
    }
}
