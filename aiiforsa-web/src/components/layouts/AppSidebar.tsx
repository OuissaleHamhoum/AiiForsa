'use client';

import { cn } from '@/lib/utils';

import {
    Briefcase,
    BriefcaseBusiness,
    FileText,
    LayoutDashboard,
    Menu,
    Mic,
    X,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';

const navigationItems = [
    {
        name: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
    },
    {
        name: 'CV Builder',
        href: '/resume-builder',
        icon: FileText,
    },
    {
        name: 'Applied Jobs',
        href: '/applied-jobs',
        icon: Briefcase,
    },
    {
        name: 'Interview simulator',
        href: '/interview',
        icon: Mic,
    },
    {
        name: 'Jobs',
        href: '/jobs',
        icon: BriefcaseBusiness,
    },
    // {
    //   name: "Templates",
    //   href: "/templates",
    //   icon: FileText,
    // },
    // {
    //   name: "Alt Tools",
    //   href: "/tools",
    //   icon: Wrench,
    // },
    // {
    //   name: "Version History",
    //   href: "/history",
    //   icon: History,
    // },
    // {
    //   name: "Settings",
    //   href: "/settings",
    //   icon: Settings,
    // },
];

// Create context for sidebar state
const SidebarContext = createContext<{
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
}>({
    isCollapsed: false,
    setIsCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function AppSidebar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { isCollapsed, setIsCollapsed } = useSidebar();
    const [isClient, setIsClient] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
        checkDesktop();
        window.addEventListener('resize', checkDesktop);
        return () => window.removeEventListener('resize', checkDesktop);
    }, []);

    const handleToggle = () => {
        if (!isClient) return;

        // On mobile/tablet: toggle mobile menu
        // On desktop: toggle sidebar visibility (hide/show completely)
        if (!isDesktop) {
            setIsMobileMenuOpen(!isMobileMenuOpen);
        } else {
            setIsCollapsed(!isCollapsed);
        }
    };

    return (
        <>
            {/* Mobile Menu Button - Only visible when sidebar is closed on mobile */}
            {!isMobileMenuOpen && (
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="lg:hidden fixed top-4 left-4 z-30 p-2.5 rounded-xl bg-gradient-to-br from-[#cf6318] to-[#b55416] border border-[#cf6318]/30 backdrop-blur-sm hover:from-[#e67320] hover:to-[#cf6318] hover:shadow-lg hover:shadow-[#cf6318]/25 transition-all duration-300"
                >
                    <Menu className="w-5 h-5 text-white" />
                </button>
            )}

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                onClick={() => {
                    // On desktop collapsed state: expand sidebar
                    if (isDesktop && isCollapsed) {
                        setIsCollapsed(false);
                    }
                }}
                className={cn(
                    'h-screen bg-[#0a0a0a] border-r border-white/5 transition-all duration-300',
                    'flex flex-col flex-shrink-0',
                    // Mobile: fixed position with slide in/out
                    'max-lg:fixed max-lg:top-0 max-lg:left-0 max-lg:z-40',
                    isMobileMenuOpen
                        ? 'max-lg:translate-x-0'
                        : 'max-lg:-translate-x-full',
                    // Desktop: static position (part of layout flow)
                    'lg:static',
                    // Width based on state
                    isCollapsed ? 'w-16' : 'w-64',
                    // Hover effects when collapsed on desktop
                    isCollapsed &&
                        'lg:cursor-pointer lg:hover:border-[#cf6318]/20',
                )}
            >
                {/* App Name */}
                <div
                    className={cn(
                        'relative px-4 py-6 border-b border-white/5 transition-all duration-300',
                        isCollapsed && 'lg:px-3 lg:py-4',
                    )}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#cf6318] flex items-center justify-center flex-shrink-0">
                            <Briefcase className="w-4 h-4 text-white" />
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <h1 className="text-xl font-bold text-white truncate">
                                    AiiForsa
                                </h1>
                                <p className="text-xs text-white/40 truncate">
                                    Job Tracker
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Toggle Button - Only shows when expanded to close */}
                    {!isCollapsed && (
                        <button
                            onClick={e => {
                                e.stopPropagation();
                                handleToggle();
                            }}
                            className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-white/5 transition-colors"
                        >
                            <X className="w-4 h-4 text-white/60 hover:text-white" />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav
                    onClick={e => e.stopPropagation()}
                    className={cn(
                        'flex-1 overflow-y-auto transition-all duration-300',
                        isCollapsed
                            ? 'px-2 py-4 space-y-1'
                            : 'px-3 py-4 space-y-1',
                    )}
                >
                    {navigationItems.map(item => {
                        const isActive =
                            pathname === item.href ||
                            pathname.startsWith(item.href + '/');
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                title={isCollapsed ? item.name : undefined}
                                className={cn(
                                    'group flex items-center rounded-lg transition-all duration-200',
                                    'text-sm font-medium',
                                    isActive
                                        ? 'bg-[#cf6318] text-white'
                                        : 'text-white/60 hover:text-white hover:bg-white/5',
                                    isCollapsed
                                        ? 'justify-center p-2.5'
                                        : 'gap-3 px-3 py-2.5',
                                )}
                            >
                                <Icon
                                    className={cn(
                                        'w-5 h-5 flex-shrink-0',
                                        isActive
                                            ? 'text-white'
                                            : 'text-white/60 group-hover:text-white',
                                    )}
                                />

                                {!isCollapsed && <span>{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer/User Info (optional) */}
                <div
                    onClick={e => e.stopPropagation()}
                    className={cn(
                        'border-t border-white/5 transition-all duration-300',
                        isCollapsed ? 'p-2' : 'p-3',
                    )}
                >
                    <div
                        className={cn(
                            'rounded-lg hover:bg-white/5 transition-all duration-200 cursor-pointer group',
                            isCollapsed
                                ? 'flex justify-center p-2'
                                : 'flex items-center gap-3 px-3 py-2.5',
                        )}
                    >
                        <div className="w-8 h-8 rounded-lg bg-[#cf6318] flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            UN
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    User Name
                                </p>
                                <p className="text-xs text-white/40 truncate">
                                    user@example.com
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
