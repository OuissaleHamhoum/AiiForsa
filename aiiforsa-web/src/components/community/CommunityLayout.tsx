'use client';

import * as React from 'react';

export interface CommunityLayoutProps {
    left?: React.ReactNode;
    center: React.ReactNode;
    right?: React.ReactNode;
    className?: string;
}

/**
 * CommunityLayout
 * Responsive 3-column layout that collapses to 1 column on small screens.
 */
export function CommunityLayout({
    left,
    center,
    right,
    className,
}: CommunityLayoutProps) {
    return (
        <div
            className={[
                'mx-auto w-full max-w-7xl px-3 md:px-6 flex gap-4',
                className || '',
            ].join(' ')}
        >
            {/* Left narrow column */}
            {left ? (
                <aside className="hidden md:block w-64 sticky top-20 self-start">
                    {left}
                </aside>
            ) : null}

            {/* Center main column */}
            <main className="flex-1 overflow-y-auto">{center}</main>

            {/* Right narrow column */}
            {right ? (
                <aside className="hidden md:block w-64">{right}</aside>
            ) : null}
        </div>
    );
}

export default CommunityLayout;
