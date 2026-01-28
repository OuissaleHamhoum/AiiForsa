'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarLinkProps {
    href: string;
    icon: LucideIcon;
    label: string;
    isCollapsed?: boolean;
}

export function SidebarLink({
    href,
    icon: Icon,
    label,
    isCollapsed = false,
}: SidebarLinkProps) {
    const pathname = usePathname();
    const isActive = pathname === href || pathname.startsWith(href + '/');

    return (
        <Link
            href={href}
            title={isCollapsed ? label : undefined}
            className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                    ? 'bg-gradient-to-r from-[#cf6318] to-[#e67320] text-white shadow-lg shadow-[#cf6318]/20'
                    : 'text-white/60 hover:bg-white/5 hover:text-white',
                isCollapsed && 'justify-center px-2',
            )}
        >
            <Icon
                className={cn(
                    'h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110',
                    isActive
                        ? 'text-white'
                        : 'text-white/60 group-hover:text-white',
                )}
            />
            {!isCollapsed && <span className="truncate">{label}</span>}
            {isActive && !isCollapsed && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />
            )}
        </Link>
    );
}
