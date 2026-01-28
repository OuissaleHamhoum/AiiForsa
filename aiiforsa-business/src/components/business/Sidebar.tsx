'use client';

import { cn } from '@/lib/utils';
import {
    BarChart3,
    Briefcase,
    Building2,
    Calendar,
    FileText,
    HelpCircle,
    LayoutDashboard,
    PlusCircle,
    Settings,
    X,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SidebarLink } from './SidebarLink';
import { SidebarFooter } from './SidebarFooter';

const primaryNavItems = [
    {
        href: '/dashboard',
        icon: LayoutDashboard,
        label: 'Dashboard',
    },
    {
        href: '/applications',
        icon: FileText,
        label: 'Applications',
    },
    {
        href: '/jobs',
        icon: Briefcase,
        label: 'Jobs',
    },
    {
        href: '/agenda',
        icon: Calendar,
        label: 'Agenda',
    },
    {
        href: '/stats',
        icon: BarChart3,
        label: 'Analytics',
    },
];

const secondaryNavItems = [
    {
        href: '/settings',
        icon: Settings,
        label: 'Settings',
    },
    {
        href: '#',
        icon: HelpCircle,
        label: 'Help',
    },
];

interface BusinessSidebarProps {
    isMobileOpen?: boolean;
    onMobileClose?: () => void;
}

export function BusinessSidebar({
    isMobileOpen = false,
    onMobileClose,
}: BusinessSidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileOpen]);

    return (
        <>
            {/* Mobile overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={onMobileClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed top-0 z-50 flex h-screen flex-col border-r border-white/5 bg-[#0a0a0a] transition-all duration-300',
                    // Mobile: slide in from left
                    'lg:static lg:z-auto',
                    isMobileOpen
                        ? 'left-0 max-lg:translate-x-0'
                        : 'max-lg:-translate-x-full',
                    // Desktop: collapsible width
                    isCollapsed ? 'w-16' : 'w-64',
                )}
            >
                {/* Brand header */}
                <div
                    className={cn(
                        'relative border-b border-white/5 px-4 py-6 transition-all',
                        isCollapsed && 'px-3 py-4',
                    )}
                >
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#cf6318] to-[#b55416] text-white shadow-lg shadow-[#cf6318]/20">
                            <Building2 className="h-5 w-5" />
                        </div>
                        {!isCollapsed && (
                            <div className="min-w-0 flex-1">
                                <h1 className="truncate text-lg font-bold text-white">
                                    Business
                                </h1>
                                <p className="truncate text-xs text-white/40">
                                    AiiForsa Platform
                                </p>
                            </div>
                        )}
                    </Link>

                    {/* Close button (mobile only) */}
                    {onMobileClose && (
                        <button
                            onClick={onMobileClose}
                            className="absolute right-4 top-4 rounded-md p-1.5 text-white/60 transition-all hover:bg-white/5 hover:text-white lg:hidden"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}

                    {/* Toggle collapse (desktop only) */}
                    {!isCollapsed && (
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="absolute right-4 top-4 hidden rounded-md p-1.5 text-white/60 transition-all hover:bg-white/5 hover:text-white lg:block"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Primary navigation */}
                <nav
                    className={cn(
                        'flex-1 space-y-1 overflow-y-auto px-3 py-4',
                        isCollapsed && 'px-2',
                    )}
                >
                    <div className="space-y-1">
                        {primaryNavItems.map(item => (
                            <div key={item.href} onClick={onMobileClose}>
                                <SidebarLink
                                    href={item.href}
                                    icon={item.icon}
                                    label={item.label}
                                    isCollapsed={isCollapsed}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="my-4 border-t border-white/5" />

                    <div className="space-y-1">
                        {secondaryNavItems.map(item => (
                            <div key={item.href} onClick={onMobileClose}>
                                <SidebarLink
                                    href={item.href}
                                    icon={item.icon}
                                    label={item.label}
                                    isCollapsed={isCollapsed}
                                />
                            </div>
                        ))}
                    </div>
                </nav>

                {/* Footer */}
                <SidebarFooter isCollapsed={isCollapsed} />

                {/* Expand button when collapsed (desktop only) */}
                {isCollapsed && (
                    <button
                        onClick={() => setIsCollapsed(false)}
                        className="absolute bottom-20 right-0 hidden translate-x-1/2 rounded-full border border-white/10 bg-[#0a0a0a] p-1.5 text-white/60 shadow-lg transition-all hover:bg-white/5 hover:text-white lg:block"
                        aria-label="Expand sidebar"
                    >
                        <PlusCircle className="h-4 w-4" />
                    </button>
                )}
            </aside>
        </>
    );
}
