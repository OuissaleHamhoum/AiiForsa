'use client';

import { Menu, X } from 'lucide-react';

interface AppHeaderCompactProps {
    onToggleSidebar?: () => void;
    isSidebarOpen?: boolean;
    title?: string;
    actions?: React.ReactNode;
}

export function AppHeaderCompact({
    onToggleSidebar,
    isSidebarOpen = false,
    title,
    actions,
}: AppHeaderCompactProps) {
    return (
        <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-xl lg:hidden">
            <div className="flex items-center gap-3 px-4 py-3">
                {onToggleSidebar && (
                    <button
                        onClick={onToggleSidebar}
                        aria-label="Toggle sidebar"
                        className="rounded-md p-2 text-white/60 transition-all hover:bg-white/5 hover:text-white"
                    >
                        {isSidebarOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </button>
                )}
                {title && (
                    <h1 className="flex-1 truncate text-lg font-semibold text-white">
                        {title}
                    </h1>
                )}
                {actions && <div className="flex-shrink-0">{actions}</div>}
            </div>
        </header>
    );
}
