'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

/**
 * Sign out page
 * Handles user sign out and redirects to login
 */
export default function SignOutPage() {
    const router = useRouter();

    useEffect(() => {
        const performSignOut = async () => {
            try {
                await signOut({
                    callbackUrl: '/login',
                    redirect: false,
                });
                // Redirect to login after sign out
                router.push('/login');
            } catch {
                // Fallback redirect
                router.push('/login');
            }
        };

        performSignOut();
    }, [router]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
            <div className="text-center space-y-4">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground">
                    Signing you out...
                </p>
            </div>
        </div>
    );
}
