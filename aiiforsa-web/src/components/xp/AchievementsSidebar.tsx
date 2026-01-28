'use client';

import {
    completeDailyChallenge,
    getXpStatus,
    redeemAchievement,
} from '@/actions/xp-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type {
    Achievement,
    Badge as BadgeType,
    DailyChallenge,
    XpStatus,
} from '@/lib/xp-constants';
import {
    CheckCircle2,
    Clock,
    Gift,
    Sparkles,
    Star,
    Trophy,
    Zap,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { XPBar } from './XPBar';

interface AchievementsSidebarProps {
    className?: string;
    onXpChange?: (xp: number, level: number) => void;
}

export function AchievementsSidebar({
    className,
    onXpChange,
}: AchievementsSidebarProps) {
    const [xpStatus, setXpStatus] = useState<XpStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [redeemingId, setRedeemingId] = useState<string | null>(null);

    const loadXpStatus = useCallback(async () => {
        const result = await getXpStatus();
        if (result.success && result.data) {
            setXpStatus(result.data);
            onXpChange?.(result.data.xp, result.data.level);
        }
        setLoading(false);
    }, [onXpChange]);

    useEffect(() => {
        loadXpStatus();
    }, [loadXpStatus]);

    const handleRedeem = async (achievementId: string) => {
        setRedeemingId(achievementId);
        try {
            const result = await redeemAchievement(achievementId);
            if (result.success) {
                toast.success('Achievement redeemed! 🎉');
                loadXpStatus();
            } else {
                toast.error(result.error || 'Failed to redeem achievement');
            }
        } catch {
            toast.error('Failed to redeem achievement');
        } finally {
            setRedeemingId(null);
        }
    };

    const handleDailyChallenge = async (challengeKey: string) => {
        try {
            const result = await completeDailyChallenge(challengeKey);
            if (result.success && result.data) {
                toast.success(`+${result.data.xpGained} XP earned! 🔥`);
                if (result.data.leveledUp) {
                    toast.success(
                        `🎉 Level Up! You're now Level ${result.data.newLevel}!`,
                        {
                            duration: 5000,
                        },
                    );
                }
                loadXpStatus();
            } else {
                toast.error(
                    result.error || 'Challenge already completed today',
                );
            }
        } catch {
            toast.error('Failed to complete challenge');
        }
    };

    if (loading) {
        return (
            <Card className={cn('p-4 animate-pulse', className)}>
                <div className="h-20 bg-white/5 rounded-lg mb-4" />
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-white/5 rounded-lg" />
                    ))}
                </div>
            </Card>
        );
    }

    if (!xpStatus) {
        return null;
    }

    const unclaimedAchievements = xpStatus.achievements.filter(a => !a.claimed);
    const claimedAchievements = xpStatus.achievements.filter(a => a.claimed);

    return (
        <Card className={cn('overflow-hidden', className)}>
            {/* Header with XP Bar */}
            <div className="relative p-4 bg-gradient-to-br from-[#cf6318]/20 to-[#e67320]/10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#e67320]/20 to-transparent rounded-full blur-2xl" />

                <div className="relative space-y-3">
                    {/* Current Badge */}
                    {xpStatus.currentBadge && (
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">
                                {xpStatus.currentBadge.icon}
                            </span>
                            <span className="font-semibold text-white">
                                {xpStatus.currentBadge.name}
                            </span>
                        </div>
                    )}

                    {/* XP Progress */}
                    <XPBar
                        xp={xpStatus.xp}
                        level={xpStatus.level}
                        nextLevelXp={xpStatus.nextLevelXp}
                        progressPercent={xpStatus.progressPercent}
                        size="md"
                    />

                    {/* Quick Stats */}
                    <div className="flex items-center justify-between text-xs text-white/60 pt-1">
                        <span>{xpStatus.badges.length} badges earned</span>
                        <span>{xpStatus.achievements.length} achievements</span>
                    </div>
                </div>
            </div>

            {/* Tabs for different sections */}
            <Tabs defaultValue="daily" className="p-3">
                <TabsList className="w-full grid grid-cols-3 mb-3">
                    <TabsTrigger value="daily" className="text-xs">
                        <Zap className="w-3 h-3 mr-1" />
                        Daily
                    </TabsTrigger>
                    <TabsTrigger value="achievements" className="text-xs">
                        <Trophy className="w-3 h-3 mr-1" />
                        Awards
                    </TabsTrigger>
                    <TabsTrigger value="badges" className="text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        Badges
                    </TabsTrigger>
                </TabsList>

                {/* Daily Challenges */}
                <TabsContent value="daily" className="mt-0">
                    <ScrollArea className="h-[300px] pr-2">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-white/60 mb-2">
                                <span>Today&apos;s Challenges</span>
                                <span>
                                    {xpStatus.dailyChallenges.completedToday}/
                                    {xpStatus.dailyChallenges.maxDaily}{' '}
                                    completed
                                </span>
                            </div>

                            {xpStatus.dailyChallenges.available.map(
                                challenge => (
                                    <DailyChallengeCard
                                        key={challenge.id}
                                        challenge={challenge}
                                        onComplete={() =>
                                            handleDailyChallenge(challenge.key)
                                        }
                                    />
                                ),
                            )}

                            {xpStatus.dailyChallenges.available.length ===
                                0 && (
                                <div className="text-center py-8 text-white/40">
                                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">
                                        No challenges available
                                    </p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </TabsContent>

                {/* Achievements */}
                <TabsContent value="achievements" className="mt-0">
                    <ScrollArea className="h-[300px] pr-2">
                        <div className="space-y-3">
                            {/* Unclaimed achievements */}
                            {unclaimedAchievements.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 text-xs text-amber-400 mb-2">
                                        <Gift className="w-3 h-3" />
                                        <span>Ready to Redeem</span>
                                    </div>
                                    <div className="space-y-2">
                                        {unclaimedAchievements.map(
                                            achievement => (
                                                <AchievementCard
                                                    key={achievement.id}
                                                    achievement={achievement}
                                                    onRedeem={() =>
                                                        handleRedeem(
                                                            achievement.id,
                                                        )
                                                    }
                                                    isRedeeming={
                                                        redeemingId ===
                                                        achievement.id
                                                    }
                                                />
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Claimed achievements */}
                            {claimedAchievements.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 text-xs text-white/40 mb-2 mt-4">
                                        <CheckCircle2 className="w-3 h-3" />
                                        <span>Collected</span>
                                    </div>
                                    <div className="space-y-2">
                                        {claimedAchievements.map(
                                            achievement => (
                                                <AchievementCard
                                                    key={achievement.id}
                                                    achievement={achievement}
                                                    claimed
                                                />
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}

                            {xpStatus.achievements.length === 0 && (
                                <div className="text-center py-8 text-white/40">
                                    <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">
                                        Complete tasks to earn achievements!
                                    </p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </TabsContent>

                {/* Badges */}
                <TabsContent value="badges" className="mt-0">
                    <ScrollArea className="h-[300px] pr-2">
                        <div className="grid grid-cols-2 gap-2">
                            {xpStatus.badges.map(badge => (
                                <BadgeCard key={badge.id} badge={badge} />
                            ))}
                        </div>

                        {xpStatus.badges.length === 0 && (
                            <div className="text-center py-8 text-white/40">
                                <Star className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">
                                    Earn XP to unlock badges!
                                </p>
                                <p className="text-xs mt-1">
                                    Next badge at 300 XP
                                </p>
                            </div>
                        )}
                    </ScrollArea>
                </TabsContent>
            </Tabs>
        </Card>
    );
}

// Sub-components

interface DailyChallengeCardProps {
    challenge: DailyChallenge;
    onComplete: () => void;
}

function DailyChallengeCard({
    challenge,
    onComplete,
}: DailyChallengeCardProps) {
    return (
        <div
            className={cn(
                'p-3 rounded-lg border transition-all',
                challenge.completed
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-white/5 border-white/10 hover:border-[#e67320]/50',
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                    <span className="text-lg">{challenge.icon || '⚡'}</span>
                    <div>
                        <p className="text-sm font-medium text-white">
                            {challenge.title}
                        </p>
                        {challenge.description && (
                            <p className="text-xs text-white/50 mt-0.5">
                                {challenge.description}
                            </p>
                        )}
                    </div>
                </div>
                <Badge
                    variant="outline"
                    className={cn(
                        'text-xs shrink-0',
                        challenge.completed
                            ? 'border-green-500/50 text-green-400'
                            : 'border-amber-500/50 text-amber-400',
                    )}
                >
                    +{challenge.xpReward} XP
                </Badge>
            </div>

            {!challenge.completed && (
                <Button
                    size="sm"
                    variant="ghost"
                    className="w-full mt-2 text-xs h-7 hover:bg-[#e67320]/20 hover:text-[#e67320]"
                    onClick={onComplete}
                >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Complete Challenge
                </Button>
            )}

            {challenge.completed && (
                <div className="flex items-center gap-1 mt-2 text-xs text-green-400">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Completed today!</span>
                </div>
            )}
        </div>
    );
}

interface AchievementCardProps {
    achievement: Achievement;
    onRedeem?: () => void;
    isRedeeming?: boolean;
    claimed?: boolean;
}

function AchievementCard({
    achievement,
    onRedeem,
    isRedeeming,
    claimed,
}: AchievementCardProps) {
    return (
        <div
            className={cn(
                'p-3 rounded-lg border transition-all',
                claimed
                    ? 'bg-white/5 border-white/10 opacity-60'
                    : 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30',
            )}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                    <span className="text-lg">{achievement.icon || '🏆'}</span>
                    <div>
                        <p className="text-sm font-medium text-white">
                            {achievement.title}
                        </p>
                        {achievement.description && (
                            <p className="text-xs text-white/50 mt-0.5 line-clamp-2">
                                {achievement.description}
                            </p>
                        )}
                        {achievement.earnCount > 1 && (
                            <Badge
                                variant="secondary"
                                className="mt-1 text-[10px] h-4"
                            >
                                x{achievement.earnCount}
                            </Badge>
                        )}
                    </div>
                </div>
                <Badge
                    variant="outline"
                    className="text-xs shrink-0 border-amber-500/50 text-amber-400"
                >
                    +{achievement.xpReward} XP
                </Badge>
            </div>

            {!claimed && onRedeem && (
                <Button
                    size="sm"
                    className="w-full mt-2 text-xs h-7 bg-gradient-to-r from-[#cf6318] to-[#e67320] hover:opacity-90"
                    onClick={onRedeem}
                    disabled={isRedeeming}
                >
                    {isRedeeming ? (
                        <span className="animate-pulse">Redeeming...</span>
                    ) : (
                        <>
                            <Gift className="w-3 h-3 mr-1" />
                            Redeem Badge
                        </>
                    )}
                </Button>
            )}

            {claimed && (
                <div className="flex items-center gap-1 mt-2 text-xs text-white/40">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Collected</span>
                </div>
            )}
        </div>
    );
}

interface BadgeCardProps {
    badge: BadgeType;
}

function BadgeCard({ badge }: BadgeCardProps) {
    return (
        <div
            className="p-3 rounded-lg bg-white/5 border border-white/10 text-center"
            style={{
                borderColor: badge.color ? `${badge.color}40` : undefined,
            }}
        >
            <div className="text-3xl mb-1">{badge.icon || '🏅'}</div>
            <p className="text-xs font-medium text-white truncate">
                {badge.name}
            </p>
            <p className="text-[10px] text-white/50">Level {badge.level}</p>
        </div>
    );
}
