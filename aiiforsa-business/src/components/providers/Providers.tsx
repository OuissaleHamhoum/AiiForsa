'use client';

import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Combined providers component
 * Wraps app with NextAuth session and React Query providers
 */
export function Providers({ children }: { children: ReactNode }) {
    const router = useRouter();

    // Create a new QueryClient instance for each user session
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Stale time: 5 minutes
                        staleTime: 5 * 60 * 1000,
                        // Cache time: 10 minutes
                        gcTime: 10 * 60 * 1000,
                        // Retry failed requests 1 time
                        retry: (failureCount, error: any) => {
                            // Don't retry on 401/403 errors (authentication/authorization issues)
                            if (
                                error?.status === 401 ||
                                error?.status === 403
                            ) {
                                // Redirect to signout on authentication failures
                                router.push('/signout');
                                return false;
                            }
                            // Retry other errors once
                            return failureCount < 1;
                        },
                        // Refetch on window focus in production
                        refetchOnWindowFocus:
                            process.env.NODE_ENV === 'production',
                    },
                    mutations: {
                        // Retry failed mutations 1 time
                        retry: (failureCount, error: any) => {
                            // Don't retry on 401/403 errors (authentication/authorization issues)
                            if (
                                error?.status === 401 ||
                                error?.status === 403
                            ) {
                                // Redirect to signout on authentication failures
                                router.push('/signout');
                                return false;
                            }
                            // Retry other errors once
                            return failureCount < 1;
                        },
                    },
                },
            }),
    );

    return (
        <SessionProvider>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </SessionProvider>
    );
}
