import { Providers } from '@/components/providers/Providers';
import { Notifications } from '@/components/ui/notifications';
import { ServerStatusBanner } from '@/components/ui/server-status-banner';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'AiiForsa - Authentication System',
    description: 'Secure authentication system with NextAuth and Next.js',
    icons: {
        icon: '/favicon.svg',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
                suppressHydrationWarning
            >
                <Providers>
                    <ServerStatusBanner />
                    {children}
                    <Notifications />
                </Providers>
            </body>
        </html>
    );
}
