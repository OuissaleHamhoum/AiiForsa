'use client';

import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { TutorialProvider } from '@/components/tutorial/TutorialContext';

/**
 * Combined providers component
 * Wraps app with NextAuth session and React Query providers
 */
export function Providers({ children }: { children: ReactNode }) {
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
                        retry: 1,
                        // Refetch on window focus in production
                        refetchOnWindowFocus:
                            process.env.NODE_ENV === 'production',
                    },
                    mutations: {
                        // Retry failed mutations 1 time
                        retry: 1,
                    },
                },
            }),
    );

    return (
        <SessionProvider>
            <QueryClientProvider client={queryClient}>
                <TutorialProvider>{children}</TutorialProvider>
            </QueryClientProvider>
        </SessionProvider>
    );
}
