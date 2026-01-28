'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LeaderboardEntry } from '@/types/challenge.types';
import { Crown, Medal, Trophy } from 'lucide-react';

export interface LeaderboardProps {
    entries: LeaderboardEntry[];
    currentUserId?: string;
}

export function Leaderboard({ entries, currentUserId }: LeaderboardProps) {
    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Crown className="h-5 w-5 text-yellow-400" />;
            case 2:
                return <Medal className="h-5 w-5 text-gray-300" />;
            case 3:
                return <Medal className="h-5 w-5 text-orange-400" />;
            default:
                return null;
        }
    };

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1:
                return 'from-yellow-500/10 to-yellow-600/5 border-yellow-500/20';
            case 2:
                return 'from-gray-400/10 to-gray-500/5 border-gray-400/20';
            case 3:
                return 'from-orange-500/10 to-orange-600/5 border-orange-500/20';
            default:
                return 'from-white/5 to-transparent border-white/10';
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-[#e67320]" />
                    <CardTitle className="text-white">Leaderboard</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {entries.map(entry => {
                        const isCurrentUser = entry.userId === currentUserId;
                        const initials = entry.username
                            .split(' ')
                            .map(n => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2);

                        return (
                            <div
                                key={entry.userId}
                                className={`flex items-center gap-3 rounded-lg border bg-gradient-to-r p-3 transition-all ${getRankColor(entry.rank)} ${
                                    isCurrentUser
                                        ? 'ring-2 ring-[#e67320]/50'
                                        : ''
                                }`}
                            >
                                {/* Rank */}
                                <div className="flex w-8 items-center justify-center">
                                    {getRankIcon(entry.rank) || (
                                        <span className="text-sm font-bold text-white/60">
                                            {entry.rank}
                                        </span>
                                    )}
                                </div>

                                {/* Avatar */}
                                <Avatar className="h-10 w-10">
                                    <AvatarImage
                                        src={entry.avatarUrl}
                                        alt={entry.username}
                                    />
                                    <AvatarFallback>{initials}</AvatarFallback>
                                </Avatar>

                                {/* User Info */}
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-semibold text-white">
                                        {entry.username}
                                        {isCurrentUser && (
                                            <Badge
                                                className="ml-2 bg-[#e67320]/20 text-[#e67320]"
                                                variant="outline"
                                            >
                                                You
                                            </Badge>
                                        )}
                                    </p>
                                    <p className="text-xs text-white/60">
                                        {entry.completedChallenges} challenges
                                    </p>
                                </div>

                                {/* Points */}
                                <div className="text-right">
                                    <p className="font-bold text-[#e67320]">
                                        {entry.points.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-white/60">
                                        points
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

export default Leaderboard;
