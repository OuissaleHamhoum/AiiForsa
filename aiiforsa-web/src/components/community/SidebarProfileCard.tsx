'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import * as React from 'react';

export interface SidebarProfileCardProps {
    user: {
        name: string;
        username: string;
        avatarUrl?: string;
        bio?: string;
    };
}

export function SidebarProfileCard({ user }: SidebarProfileCardProps) {
    const initials = React.useMemo(() => {
        const parts = user.name.split(' ');
        return parts
            .map(p => p[0]?.toUpperCase() ?? '')
            .slice(0, 2)
            .join('');
    }, [user.name]);

    return (
        <Card className="rounded-2xl p-4">
            <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                    <AvatarImage
                        src={user.avatarUrl}
                        alt={`${user.name} avatar`}
                    />
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col">
                    <Link
                        href={`/profile/${user.username}`}
                        aria-label={`Go to ${user.name}'s profile`}
                        className="truncate font-semibold text-white hover:underline"
                    >
                        {user.name}
                    </Link>
                    <span className="truncate text-sm text-white/60">
                        @{user.username}
                    </span>
                </div>
            </div>
            {user.bio ? (
                <p className="mt-3 text-sm text-white/60">{user.bio}</p>
            ) : null}
            <div className="mt-4 flex items-center gap-2">
                <Badge className="bg-[#e67320] text-[#0a0a0a]">Creator</Badge>
                <Badge className="bg-white/10 text-white/80 border-white/20">
                    Level 3
                </Badge>
            </div>
        </Card>
    );
}

export default SidebarProfileCard;
