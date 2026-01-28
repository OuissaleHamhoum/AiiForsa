'use client';

import { cn } from '@/lib/utils';
import { Building2, ChevronDown, LogOut, User } from 'lucide-react';
import { useState } from 'react';

interface SidebarFooterProps {
    isCollapsed?: boolean;
    organizationName?: string;
    userName?: string;
    userEmail?: string;
}

export function SidebarFooter({
    isCollapsed = false,
    organizationName = 'Acme Inc.',
    userName = 'John Doe',
    userEmail = 'john@acme.example',
}: SidebarFooterProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (isCollapsed) {
        return (
            <div className="border-t border-white/5 p-2">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    title={organizationName}
                    className="flex h-10 w-full items-center justify-center rounded-lg bg-gradient-to-br from-[#cf6318] to-[#b55416] text-white transition-all hover:scale-105"
                >
                    <Building2 className="h-5 w-5" />
                </button>
            </div>
        );
    }

    return (
        <div className="relative border-t border-white/5 p-3">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-all',
                    'hover:bg-white/5',
                )}
            >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#cf6318] to-[#b55416] text-white font-semibold text-sm">
                    {organizationName.charAt(0)}
                </div>
                <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-sm font-medium text-white">
                        {organizationName}
                    </p>
                    <p className="truncate text-xs text-white/40">{userName}</p>
                </div>
                <ChevronDown
                    className={cn(
                        'h-4 w-4 flex-shrink-0 text-white/60 transition-transform',
                        isOpen && 'rotate-180',
                    )}
                />
            </button>

            {/* Dropdown menu */}
            {isOpen && (
                <div className="absolute bottom-full left-3 right-3 mb-2 overflow-hidden rounded-lg border border-white/10 bg-[#1a1a1a] shadow-xl">
                    <div className="border-b border-white/5 p-3">
                        <p className="truncate text-sm font-medium text-white">
                            {userName}
                        </p>
                        <p className="truncate text-xs text-white/40">
                            {userEmail}
                        </p>
                    </div>
                    <div className="p-1">
                        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-white/60 transition-all hover:bg-white/5 hover:text-white">
                            <User className="h-4 w-4" />
                            <span>Account</span>
                        </button>
                        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-white/60 transition-all hover:bg-white/5 hover:text-white">
                            <LogOut className="h-4 w-4" />
                            <span>Sign out</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
