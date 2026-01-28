'use client';

import styles from '@/styles/Background.module.css';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen">
            {/* Fixed background */}
            <div className={styles['radial-background']}></div>

            <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">{children}</div>
            </div>
        </div>
    );
}
