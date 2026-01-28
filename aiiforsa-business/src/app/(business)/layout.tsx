'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { BusinessSidebar } from '@/components/business/Sidebar';
import { AppHeaderCompact } from '@/components/business/AppHeaderCompact';
import { Toaster } from '@/components/ui/sonner';
import styles from '@/styles/Background.module.css';

export default function BusinessLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    // Authentication and authorization check
    useEffect(() => {
        if (status === 'loading') return;

        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        // Check if user has business role
        if (session?.user?.role !== 'BUSINESS') {
            router.push('/login?error=unauthorized');
            return;
        }

        // Handle session errors - redirect to signout
        if (status === 'authenticated' && !session?.user) {
            router.push('/signout');
            return;
        }
    }, [status, session, router]);

    // Show loading state while checking authentication
    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Only render if authenticated and has business role
    if (status !== 'authenticated' || session?.user?.role !== 'BUSINESS') {
        return null;
    }

    return (
        <div className="relative min-h-screen flex">
            {/* Fixed background */}
            <div className={styles['radial-background']}></div>{' '}
            <div className="relative z-10 flex w-full">
                {/* Sidebar */}
                <BusinessSidebar
                    isMobileOpen={isMobileSidebarOpen}
                    onMobileClose={() => setIsMobileSidebarOpen(false)}
                />

                {/* Main content */}
                <div className="flex min-h-screen flex-1 flex-col">
                    {/* Mobile header */}
                    <AppHeaderCompact
                        onToggleSidebar={() =>
                            setIsMobileSidebarOpen(!isMobileSidebarOpen)
                        }
                        isSidebarOpen={isMobileSidebarOpen}
                    />

                    {/* Page content */}
                    <main className="flex-1 overflow-auto">
                        <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
            <Toaster position="top-right" richColors />
        </div>
    );
}
