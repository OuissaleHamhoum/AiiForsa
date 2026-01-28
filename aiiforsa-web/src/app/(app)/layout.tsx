'use client';

import { AppHeader } from '@/components/layouts/AppHeader';
import { RightSidebar } from '@/components/layouts/RightSidebar';
import { Toaster } from '@/components/ui/sonner';
import { XpProvider } from '@/components/xp/XpContext';
import { TutorialModal } from '@/components/tutorial/TutorialModal';
import styles from '@/styles/Background.module.css';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <XpProvider>
            <div className="relative min-h-screen flex flex-col">
                {/* Fixed background */}
                <div className={styles['radial-background']}></div>

                <div className="relative z-10 flex flex-col">
                    <AppHeader />

                    <main className="flex-1 flex items-center">
                        <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-20">
                            {children}
                        </div>
                    </main>
                </div>

                <RightSidebar />

                <Toaster position="top-right" richColors />
                <TutorialModal />
            </div>
        </XpProvider>
    );
}
