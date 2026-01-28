import type { Metadata } from 'next';
import './resume/[slug]/print.css';

export const metadata: Metadata = {
    title: 'Shared Resume',
    description: 'View shared professional resume',
};

/**
 * Public Layout
 * Minimal layout for public-facing pages without authentication
 */
export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
