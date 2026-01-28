'use client';

import {
    deleteNotification,
    getNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    type Notification,
} from '@/actions/notification-actions';
import {
    completeDailyChallenge,
    getXpStatus,
    redeemAchievement,
} from '@/actions/xp-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLogout } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import type { XpStatus } from '@/lib/xp-constants';
import { useUIStore } from '@/stores/ui.store';
import {
    Bell,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Crown,
    ExternalLink,
    Flame,
    Gift,
    LogOut,
    Star,
    Trash2,
    Trophy,
    Users,
    Zap,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

export function RightSidebar() {
    const { data: session } = useSession();
    const logoutMutation = useLogout();
    const { isSidebarOpen, toggleSidebar } = useUIStore();
    const isExpanded = isSidebarOpen;
    const [activeTab, setActiveTab] = useState<
        'achievements' | 'notifications' | 'friends'
    >('achievements');
    const [xpStatus, setXpStatus] = useState<XpStatus | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [notificationsLoading, setNotificationsLoading] = useState(true);
    const [redeemingId, setRedeemingId] = useState<string | null>(null);

    // Load XP status
    const loadXpStatus = useCallback(async () => {
        try {
            const result = await getXpStatus();
            if (result.success && result.data) {
                setXpStatus(result.data);
            }
        } catch (error) {
            console.error('Failed to load XP status:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load Notifications
    const loadNotifications = useCallback(async () => {
        try {
            setNotificationsLoading(true);
            const result = await getNotifications({
                includeRead: true,
                limit: 20,
            });
            if (result.success && result.data) {
                // Ensure data is an array
                setNotifications(Array.isArray(result.data) ? result.data : []);
            } else {
                setNotifications([]);
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
            setNotifications([]);
        } finally {
            setNotificationsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadXpStatus();
        loadNotifications();
    }, [loadXpStatus, loadNotifications]);

    // Handle redeem achievement
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

    // Handle daily challenge completion
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

    // Handle mark notification as read
    const handleMarkAsRead = async (notificationId: string) => {
        try {
            const result = await markNotificationAsRead(notificationId);
            if (result.success) {
                setNotifications(prev =>
                    prev.map(n =>
                        n.id === notificationId ? { ...n, isRead: true } : n,
                    ),
                );
            }
        } catch {
            toast.error('Failed to mark notification as read');
        }
    };

    // Handle mark all notifications as read
    const handleMarkAllAsRead = async () => {
        try {
            const result = await markAllNotificationsAsRead();
            if (result.success) {
                setNotifications(prev =>
                    prev.map(n => ({ ...n, isRead: true })),
                );
                toast.success('All notifications marked as read');
            }
        } catch {
            toast.error('Failed to mark all as read');
        }
    };

    // Handle delete notification
    const handleDeleteNotification = async (notificationId: string) => {
        try {
            const result = await deleteNotification(notificationId);
            if (result.success) {
                setNotifications(prev =>
                    prev.filter(n => n.id !== notificationId),
                );
                toast.success('Notification deleted');
            }
        } catch {
            toast.error('Failed to delete notification');
        }
    };

    // Use real XP data or fallbacks
    const userLevel = xpStatus?.level ?? 0;
    const currentXP = xpStatus?.xp ?? 0;
    const nextLevelXP = xpStatus?.nextLevelXp ?? 300;
    const xpProgress = xpStatus?.progressPercent ?? 0;
    const streak = 7; // TODO: Implement streak tracking
    const rank = xpStatus?.currentBadge?.name || 'Newcomer';

    // Notification counts - ensure notifications is an array
    const notificationsArray = Array.isArray(notifications)
        ? notifications
        : [];
    const unreadCount = notificationsArray.filter(n => !n.isRead).length;

    // Mock network/friends data
    const friends = [
        {
            id: '1',
            name: 'Sarah Chen',
            avatar: 'SC',
            status: 'online',
            level: 8,
            activity: 'Applied to 3 jobs',
        },
        {
            id: '2',
            name: 'Mike Johnson',
            avatar: 'MJ',
            status: 'offline',
            level: 6,
            activity: 'Got an interview!',
        },
        {
            id: '3',
            name: 'Emma Davis',
            avatar: 'ED',
            status: 'online',
            level: 9,
            activity: 'Updated resume',
        },
    ];

    // Calculate online friends
    const onlineFriends = friends.filter(f => f.status === 'online').length;

    return (
        <>
            {isExpanded && (
                <div
                    className="fixed inset-0 bg-black/70 z-30 backdrop-blur-sm"
                    onClick={toggleSidebar}
                />
            )}
            <aside
                className={cn(
                    'hidden lg:flex lg:flex-col border-l border-white/10 bg-[#0a0a0a]/50 backdrop-blur-sm transition-all duration-300 group',
                    isExpanded
                        ? 'lg:w-80 xl:w-96'
                        : 'lg:w-16 cursor-pointer hover:bg-white/5',
                )}
                style={{
                    position: 'fixed',
                    top: '48px', // Height of the new compact header (h-12)
                    right: 0,
                    bottom: 0,
                    zIndex: 40,
                }}
                onClick={() => !isExpanded && toggleSidebar()}
            >
                {/* Collapse/Expand Button */}
                {isExpanded && (
                    <button
                        onClick={e => {
                            e.stopPropagation();
                            toggleSidebar();
                        }}
                        className="absolute top-4 -left-3 z-20 w-6 h-6 rounded-full bg-[#cf6318] hover:bg-[#e67320] border border-white/20 flex items-center justify-center shadow-lg transition-colors"
                    >
                        <ChevronRight className="w-3.5 h-3.5 text-white" />
                    </button>
                )}

                {/* Collapsed State - Vertical Icons */}
                {!isExpanded && (
                    <div className="flex-1 flex flex-col items-center py-6 space-y-6">
                        {/* Profile with XP Ring */}
                        <div className="relative">
                            <svg className="w-[48px] h-[48px] -rotate-90">
                                <circle
                                    cx="24"
                                    cy="24"
                                    r="21"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.1)"
                                    strokeWidth="2"
                                />
                                <circle
                                    cx="24"
                                    cy="24"
                                    r="21"
                                    fill="none"
                                    stroke="url(#gradientCollapsed)"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeDasharray={`${2 * Math.PI * 21}`}
                                    strokeDashoffset={`${2 * Math.PI * 21 * (1 - xpProgress / 100)}`}
                                    className="transition-all duration-500"
                                />
                                <defs>
                                    <linearGradient
                                        id="gradientCollapsed"
                                        x1="0%"
                                        y1="0%"
                                        x2="100%"
                                        y2="100%"
                                    >
                                        <stop offset="0%" stopColor="#cf6318" />
                                        <stop
                                            offset="100%"
                                            stopColor="#e67320"
                                        />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-[38px] h-[38px] rounded-full bg-gradient-to-br from-[#cf6318] to-[#b55416] flex items-center justify-center text-sm font-bold text-white shadow-lg">
                                    {session?.user?.name?.charAt(0) || 'U'}
                                </div>
                            </div>
                            <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-[#cf6318] to-[#e67320] border-2 border-[#0a0a0a] shadow-lg">
                                <span className="text-[8px] font-black text-white">
                                    {userLevel}
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-4 opacity-60 group-hover:opacity-100 transition-opacity">
                            <div className="relative group/icon">
                                <Trophy className="w-5 h-5 text-[#cf6318]" />
                                <div className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-red-500 border border-white text-[8px] font-bold text-white">
                                    12
                                </div>
                            </div>
                            <div className="relative group/icon">
                                <Flame className="w-5 h-5 text-orange-400" />
                                <div className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-orange-500 border border-white text-[8px] font-bold text-white">
                                    {streak}
                                </div>
                            </div>
                            <div className="relative group/icon">
                                <Users className="w-5 h-5 text-[#cf6318]" />
                                <div className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-green-500 border border-white text-[8px] font-bold text-white">
                                    {onlineFriends}
                                </div>
                            </div>
                        </div>
                        <div className="mt-auto">
                            <ChevronLeft className="w-5 h-5 text-white/40 animate-pulse" />
                        </div>
                    </div>
                )}

                {/* Expanded State - Full Content */}
                {isExpanded && (
                    <>
                        <div
                            className="flex-1 overflow-y-auto p-6 space-y-6 [&::-webkit-scrollbar]:hidden"
                            style={{
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                            }}
                        >
                            {/* Enhanced User Profile Card */}
                            <Link href="/profile" className="block">
                                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#cf6318]/20 via-[#0a0a0a] to-[#e67320]/20 border border-[#cf6318]/30 p-5 backdrop-blur-xl cursor-pointer hover:border-[#cf6318]/50 transition-all duration-300 hover:scale-[1.02] group/card">
                                    {/* Animated Background Pattern */}
                                    <div className="absolute inset-0 opacity-10 group-hover/card:opacity-20 transition-opacity">
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(207,99,24,0.3),transparent_50%)]" />
                                    </div>

                                    <div className="relative space-y-4">
                                        {/* Profile Header */}
                                        <div className="flex items-start gap-4">
                                            {/* Profile Picture with Enhanced XP Ring */}
                                            <div className="relative flex-shrink-0 group/profile">
                                                {/* Outer Glow */}
                                                <div className="absolute inset-0 bg-gradient-to-br from-[#cf6318] to-[#e67320] rounded-full blur-xl opacity-40 group-hover/profile:opacity-60 transition-opacity" />

                                                {/* XP Progress Ring */}
                                                <svg className="relative w-[72px] h-[72px] -rotate-90 drop-shadow-2xl">
                                                    {/* Background ring */}
                                                    <circle
                                                        cx="36"
                                                        cy="36"
                                                        r="33"
                                                        fill="none"
                                                        stroke="rgba(255,255,255,0.08)"
                                                        strokeWidth="4"
                                                    />
                                                    {/* Progress ring with animation */}
                                                    <circle
                                                        cx="36"
                                                        cy="36"
                                                        r="33"
                                                        fill="none"
                                                        stroke="url(#gradient)"
                                                        strokeWidth="4"
                                                        strokeLinecap="round"
                                                        strokeDasharray={`${2 * Math.PI * 33}`}
                                                        strokeDashoffset={`${2 * Math.PI * 33 * (1 - xpProgress / 100)}`}
                                                        className="transition-all duration-700 ease-out"
                                                        style={{
                                                            filter: 'drop-shadow(0 0 8px rgba(207, 99, 24, 0.6))',
                                                        }}
                                                    />
                                                    <defs>
                                                        <linearGradient
                                                            id="gradient"
                                                            x1="0%"
                                                            y1="0%"
                                                            x2="100%"
                                                            y2="100%"
                                                        >
                                                            <stop
                                                                offset="0%"
                                                                stopColor="#cf6318"
                                                            />
                                                            <stop
                                                                offset="50%"
                                                                stopColor="#e67320"
                                                            />
                                                            <stop
                                                                offset="100%"
                                                                stopColor="#ff8c42"
                                                            />
                                                        </linearGradient>
                                                    </defs>
                                                </svg>

                                                {/* Profile Picture */}
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-[#cf6318] via-[#e67320] to-[#ff8c42] flex items-center justify-center text-2xl font-black text-white shadow-2xl ring-2 ring-white/20 group-hover/profile:scale-110 transition-transform duration-300">
                                                        {session?.user?.name?.charAt(
                                                            0,
                                                        ) || 'U'}
                                                    </div>
                                                </div>

                                                {/* Level Badge - Enhanced */}
                                                <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#cf6318] via-[#e67320] to-[#ff8c42] border-[3px] border-[#0a0a0a] shadow-2xl group-hover/profile:scale-110 transition-transform duration-300">
                                                    <span className="text-xs font-black text-white drop-shadow-lg">
                                                        {userLevel}
                                                    </span>
                                                </div>

                                                {/* Online Status - Pulsing */}
                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-[3px] border-[#0a0a0a] shadow-lg">
                                                    <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75" />
                                                </div>
                                            </div>

                                            {/* User Info */}
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <h3 className="font-bold text-lg text-white truncate drop-shadow-lg">
                                                    {session?.user?.name ||
                                                        'User'}
                                                </h3>
                                                <p className="text-xs text-white/60 truncate">
                                                    {session?.user?.email}
                                                </p>

                                                {/* Rank Badge */}
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                                                    <Crown className="w-3 h-3 text-purple-400" />
                                                    <span className="text-xs font-bold text-purple-300">
                                                        {rank}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Streak Badge - Enhanced */}
                                            <div className="absolute top-0 right-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-red-500 shadow-lg border border-orange-400/50">
                                                <Flame className="w-4 h-4 text-white drop-shadow-lg animate-pulse" />
                                                <span className="text-sm font-black text-white drop-shadow-lg">
                                                    {streak}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            {/* Tab Navigation */}
                            <Tabs
                                value={activeTab}
                                onValueChange={v =>
                                    setActiveTab(
                                        v as
                                            | 'achievements'
                                            | 'notifications'
                                            | 'friends',
                                    )
                                }
                                className="w-full"
                            >
                                <TabsList className="w-full grid grid-cols-3 mb-3 bg-white/5">
                                    <TabsTrigger
                                        value="achievements"
                                        className="text-xs data-[state=active]:bg-[#cf6318]/20 data-[state=active]:text-[#e67320]"
                                    >
                                        <Trophy className="w-3 h-3 mr-1" />
                                        XP
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="notifications"
                                        className="text-xs data-[state=active]:bg-[#cf6318]/20 data-[state=active]:text-[#e67320] relative"
                                    >
                                        <Bell className="w-3 h-3 mr-1" />
                                        Notifs
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[8px] flex items-center justify-center text-white font-bold">
                                                {unreadCount > 9
                                                    ? '9+'
                                                    : unreadCount}
                                            </span>
                                        )}
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="friends"
                                        className="text-xs data-[state=active]:bg-[#cf6318]/20 data-[state=active]:text-[#e67320]"
                                    >
                                        <Users className="w-3 h-3 mr-1" />
                                        Network
                                    </TabsTrigger>
                                </TabsList>

                                {/* Achievements Tab */}
                                <TabsContent
                                    value="achievements"
                                    className="mt-0"
                                >
                                    <ScrollArea className="h-[320px] pr-2">
                                        <div className="space-y-4">
                                            {/* XP Progress */}
                                            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                                <div className="flex items-center justify-between text-xs mb-2">
                                                    <span className="text-white/60">
                                                        Level {userLevel}
                                                    </span>
                                                    <span className="text-[#e67320] font-semibold">
                                                        {currentXP}/
                                                        {nextLevelXP} XP
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-[#cf6318] to-[#e67320] transition-all duration-500"
                                                        style={{
                                                            width: `${Math.min(100, xpProgress)}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Daily Challenges */}
                                            {xpStatus?.dailyChallenges &&
                                                xpStatus.dailyChallenges
                                                    .available.length > 0 && (
                                                    <div>
                                                        <div className="flex items-center gap-2 text-xs text-white/60 mb-2">
                                                            <Zap className="w-3 h-3 text-amber-400" />
                                                            <span>
                                                                Daily Challenges
                                                                (
                                                                {
                                                                    xpStatus
                                                                        .dailyChallenges
                                                                        .completedToday
                                                                }
                                                                /
                                                                {
                                                                    xpStatus
                                                                        .dailyChallenges
                                                                        .maxDaily
                                                                }
                                                                )
                                                            </span>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {xpStatus.dailyChallenges.available.map(
                                                                challenge => (
                                                                    <div
                                                                        key={
                                                                            challenge.id
                                                                        }
                                                                        className={cn(
                                                                            'p-2 rounded-lg border transition-all',
                                                                            challenge.completed
                                                                                ? 'bg-green-500/10 border-green-500/30'
                                                                                : 'bg-white/5 border-white/10 hover:border-[#e67320]/50 cursor-pointer',
                                                                        )}
                                                                        onClick={() =>
                                                                            !challenge.completed &&
                                                                            handleDailyChallenge(
                                                                                challenge.key,
                                                                            )
                                                                        }
                                                                    >
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex items-center gap-2">
                                                                                <span>
                                                                                    {challenge.icon ||
                                                                                        '⚡'}
                                                                                </span>
                                                                                <span className="text-xs text-white">
                                                                                    {
                                                                                        challenge.title
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                            {challenge.completed ? (
                                                                                <CheckCircle2 className="w-4 h-4 text-green-400" />
                                                                            ) : (
                                                                                <Badge
                                                                                    variant="outline"
                                                                                    className="text-[10px] border-amber-500/50 text-amber-400"
                                                                                >
                                                                                    +
                                                                                    {
                                                                                        challenge.xpReward
                                                                                    }{' '}
                                                                                    XP
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                            {/* Unclaimed Achievements */}
                                            {xpStatus?.achievements &&
                                                xpStatus.achievements.filter(
                                                    a => !a.claimed,
                                                ).length > 0 && (
                                                    <div>
                                                        <div className="flex items-center gap-2 text-xs text-amber-400 mb-2">
                                                            <Gift className="w-3 h-3" />
                                                            <span>
                                                                Ready to Redeem
                                                            </span>
                                                        </div>
                                                        <div className="space-y-2">
                                                            {xpStatus.achievements
                                                                .filter(
                                                                    a =>
                                                                        !a.claimed,
                                                                )
                                                                .map(
                                                                    achievement => (
                                                                        <div
                                                                            key={
                                                                                achievement.id
                                                                            }
                                                                            className="p-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30"
                                                                        >
                                                                            <div className="flex items-center justify-between mb-1">
                                                                                <div className="flex items-center gap-2">
                                                                                    <span>
                                                                                        {achievement.icon ||
                                                                                            '🏆'}
                                                                                    </span>
                                                                                    <span className="text-xs font-medium text-white">
                                                                                        {
                                                                                            achievement.title
                                                                                        }
                                                                                    </span>
                                                                                </div>
                                                                                <Badge
                                                                                    variant="outline"
                                                                                    className="text-[10px] border-amber-500/50 text-amber-400"
                                                                                >
                                                                                    +
                                                                                    {
                                                                                        achievement.xpReward
                                                                                    }{' '}
                                                                                    XP
                                                                                </Badge>
                                                                            </div>
                                                                            <Button
                                                                                size="sm"
                                                                                className="w-full h-6 text-[10px] bg-gradient-to-r from-[#cf6318] to-[#e67320] hover:opacity-90"
                                                                                onClick={() =>
                                                                                    handleRedeem(
                                                                                        achievement.id,
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    redeemingId ===
                                                                                    achievement.id
                                                                                }
                                                                            >
                                                                                {redeemingId ===
                                                                                achievement.id
                                                                                    ? 'Redeeming...'
                                                                                    : 'Redeem Badge'}
                                                                            </Button>
                                                                        </div>
                                                                    ),
                                                                )}
                                                        </div>
                                                    </div>
                                                )}

                                            {/* Collected Badges */}
                                            {xpStatus?.badges &&
                                                xpStatus.badges.length > 0 && (
                                                    <div>
                                                        <div className="flex items-center gap-2 text-xs text-white/40 mb-2">
                                                            <Star className="w-3 h-3" />
                                                            <span>
                                                                Badges Earned (
                                                                {
                                                                    xpStatus
                                                                        .badges
                                                                        .length
                                                                }
                                                                )
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            {xpStatus.badges.map(
                                                                badge => (
                                                                    <div
                                                                        key={
                                                                            badge.id
                                                                        }
                                                                        className="p-2 rounded-lg bg-white/5 border border-white/10 text-center"
                                                                        style={{
                                                                            borderColor:
                                                                                badge.color
                                                                                    ? `${badge.color}40`
                                                                                    : undefined,
                                                                        }}
                                                                    >
                                                                        <div className="text-xl mb-1">
                                                                            {badge.icon ||
                                                                                '🏅'}
                                                                        </div>
                                                                        <p className="text-[10px] text-white/70 truncate">
                                                                            {
                                                                                badge.name
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                            {/* Empty state */}
                                            {!loading &&
                                                (!xpStatus?.achievements ||
                                                    xpStatus.achievements
                                                        .length === 0) &&
                                                (!xpStatus?.badges ||
                                                    xpStatus.badges.length ===
                                                        0) && (
                                                    <div className="text-center py-6 text-white/40">
                                                        <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                        <p className="text-sm">
                                                            Complete tasks to
                                                            earn XP!
                                                        </p>
                                                    </div>
                                                )}
                                        </div>
                                    </ScrollArea>
                                </TabsContent>

                                {/* Notifications Tab */}
                                <TabsContent
                                    value="notifications"
                                    className="mt-0"
                                >
                                    <ScrollArea className="h-[320px] pr-2">
                                        <div className="space-y-3">
                                            {/* Header with Mark All Read */}
                                            {notificationsArray.length > 0 &&
                                                unreadCount > 0 && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-white/60">
                                                            {unreadCount} unread
                                                        </span>
                                                        <button
                                                            onClick={
                                                                handleMarkAllAsRead
                                                            }
                                                            className="text-xs text-[#cf6318] hover:text-[#e67320] transition-colors"
                                                        >
                                                            Mark all read
                                                        </button>
                                                    </div>
                                                )}

                                            {/* Notification List */}
                                            {notificationsLoading ? (
                                                <div className="text-center py-6 text-white/40">
                                                    <div className="animate-spin w-6 h-6 border-2 border-[#cf6318] border-t-transparent rounded-full mx-auto mb-2" />
                                                    <p className="text-sm">
                                                        Loading...
                                                    </p>
                                                </div>
                                            ) : notificationsArray.length ===
                                              0 ? (
                                                <div className="text-center py-6 text-white/40">
                                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                    <p className="text-sm">
                                                        No notifications yet
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {notificationsArray.map(
                                                        notification => (
                                                            <div
                                                                key={
                                                                    notification.id
                                                                }
                                                                className={cn(
                                                                    'group p-3 rounded-lg border transition-all relative',
                                                                    notification.isRead
                                                                        ? 'bg-white/5 border-white/10'
                                                                        : 'bg-[#cf6318]/10 border-[#cf6318]/30',
                                                                )}
                                                                onClick={() =>
                                                                    !notification.isRead &&
                                                                    handleMarkAsRead(
                                                                        notification.id,
                                                                    )
                                                                }
                                                            >
                                                                {/* Unread indicator */}
                                                                {!notification.isRead && (
                                                                    <div className="absolute top-3 right-3 w-2 h-2 bg-[#cf6318] rounded-full" />
                                                                )}

                                                                {/* Notification content */}
                                                                <div className="pr-6">
                                                                    <div className="flex items-start gap-2 mb-1">
                                                                        <span className="text-sm">
                                                                            {notification.type ===
                                                                                'ACHIEVEMENT' &&
                                                                                '🏆'}
                                                                            {notification.type ===
                                                                                'APPLICATION_UPDATE' &&
                                                                                '💼'}
                                                                            {notification.type ===
                                                                                'MESSAGE' &&
                                                                                '💬'}
                                                                            {notification.type ===
                                                                                'JOB_RECOMMENDATION' &&
                                                                                '🎯'}
                                                                            {notification.type ===
                                                                                'INTERVIEW_REMINDER' &&
                                                                                '📅'}
                                                                            {notification.type ===
                                                                                'DEADLINE_REMINDER' &&
                                                                                '⏰'}
                                                                            {notification.type ===
                                                                                'SYSTEM' &&
                                                                                '🔔'}
                                                                        </span>
                                                                        <span
                                                                            className={cn(
                                                                                'text-xs font-medium',
                                                                                notification.priority ===
                                                                                    'HIGH' ||
                                                                                    notification.priority ===
                                                                                        'URGENT'
                                                                                    ? 'text-amber-400'
                                                                                    : 'text-white',
                                                                            )}
                                                                        >
                                                                            {
                                                                                notification.title
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs text-white/60 line-clamp-2">
                                                                        {
                                                                            notification.message
                                                                        }
                                                                    </p>
                                                                    <div className="flex items-center justify-between mt-2">
                                                                        <span className="text-[10px] text-white/40">
                                                                            {new Date(
                                                                                notification.createdAt,
                                                                            ).toLocaleDateString()}
                                                                        </span>
                                                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            {notification.actionUrl && (
                                                                                <Link
                                                                                    href={
                                                                                        notification.actionUrl
                                                                                    }
                                                                                    className="text-[#cf6318] hover:text-[#e67320]"
                                                                                    onClick={e =>
                                                                                        e.stopPropagation()
                                                                                    }
                                                                                >
                                                                                    <ExternalLink className="w-3 h-3" />
                                                                                </Link>
                                                                            )}
                                                                            <button
                                                                                onClick={e => {
                                                                                    e.stopPropagation();
                                                                                    handleDeleteNotification(
                                                                                        notification.id,
                                                                                    );
                                                                                }}
                                                                                className="text-red-400 hover:text-red-300"
                                                                            >
                                                                                <Trash2 className="w-3 h-3" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </TabsContent>

                                {/* Friends Tab */}
                                <TabsContent value="friends" className="mt-0">
                                    <div className="space-y-3 animate-in fade-in duration-300">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-bold text-white/90 flex items-center gap-2">
                                                <div className="w-1 h-4 bg-gradient-to-b from-[#cf6318] to-[#e67320] rounded-full" />
                                                Network ({friends.length})
                                            </h4>
                                            <Link
                                                href="/network"
                                                className="text-xs font-semibold text-[#cf6318] hover:text-[#e67320] transition-colors"
                                            >
                                                See All →
                                            </Link>
                                        </div>

                                        <div className="space-y-2">
                                            {friends.map(friend => (
                                                <div
                                                    key={friend.id}
                                                    className="group/friend relative overflow-hidden rounded-xl bg-white/5 border border-white/10 p-3 hover:bg-white/10 hover:border-[#cf6318]/50 transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                                                >
                                                    {/* Hover Gradient */}
                                                    <div className="absolute inset-0 bg-gradient-to-r from-[#cf6318]/0 via-[#cf6318]/10 to-[#cf6318]/0 opacity-0 group-hover/friend:opacity-100 transition-opacity" />

                                                    <div className="relative flex items-center gap-3">
                                                        <div className="relative">
                                                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#cf6318] to-[#b55416] flex items-center justify-center text-sm font-bold text-white shadow-lg group-hover/friend:scale-110 transition-transform duration-300">
                                                                {friend.avatar}
                                                            </div>
                                                            <div
                                                                className={cn(
                                                                    'absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#0a0a0a]',
                                                                    friend.status ===
                                                                        'online'
                                                                        ? 'bg-green-500'
                                                                        : 'bg-white/20',
                                                                )}
                                                            >
                                                                {friend.status ===
                                                                    'online' && (
                                                                    <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75" />
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-white truncate group-hover/friend:text-[#cf6318] transition-colors">
                                                                {friend.name}
                                                            </p>
                                                            <p className="text-xs text-white/60 truncate">
                                                                {
                                                                    friend.activity
                                                                }
                                                            </p>
                                                            <div className="flex items-center gap-1 mt-0.5">
                                                                <div className="px-1.5 py-0.5 bg-[#cf6318]/20 rounded text-[10px] font-bold text-[#cf6318]">
                                                                    LVL{' '}
                                                                    {
                                                                        friend.level
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-white/40 group-hover/friend:text-[#cf6318] group-hover/friend:translate-x-1 transition-all" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <Button className="w-full bg-gradient-to-r from-[#cf6318] to-[#e67320] hover:from-[#e67320] hover:to-[#ff8c42] text-white font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                                            <Users className="w-4 h-4 mr-2" />
                                            Find Friends
                                        </Button>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Enhanced Logout Button */}
                        <div className="border-t border-white/10 p-4 bg-[#0a0a0a]/80 backdrop-blur-sm">
                            <Button
                                onClick={e => {
                                    e.stopPropagation();
                                    logoutMutation.mutate();
                                }}
                                disabled={logoutMutation.isPending}
                                className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 hover:text-red-300 font-bold shadow-lg hover:shadow-red-500/20 hover:scale-105 transition-all duration-300"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                {logoutMutation.isPending
                                    ? 'Logging out...'
                                    : 'Logout'}
                            </Button>
                        </div>
                    </>
                )}
            </aside>
        </>
    );
}
