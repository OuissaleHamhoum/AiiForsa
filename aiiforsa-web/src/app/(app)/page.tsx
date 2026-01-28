'use client';

import {
    getAchievementDefinitionsWithProgress,
    getXpStatus,
    redeemAchievement,
    type AchievementDefinitionWithProgress,
} from '@/actions/xp-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import type { XpStatus } from '@/lib/xp-constants';
import {
    Award,
    Briefcase,
    Calendar,
    CheckCircle2,
    ClipboardCheck,
    Clock,
    Crown,
    FileText,
    Gift,
    GraduationCap,
    Medal,
    MessageSquare,
    Plus,
    Rocket,
    Sparkles,
    Star,
    Target,
    TrendingUp,
    Trophy,
    User,
    UserCheck,
    Users,
    Wrench,
    Zap,
    type LucideIcon,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { LoadingSkeleton } from './_components/LoadingSkeleton';
import { useTutorial } from '@/components/tutorial/TutorialContext';

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { triggerTutorial } = useTutorial();

    // Achievement state
    const [xpStatus, setXpStatus] = useState<XpStatus | null>(null);
    const [achievementsLoading, setAchievementsLoading] = useState(false);
    const [redeemingId, setRedeemingId] = useState<string | null>(null);

    // Quests state (achievement definitions with progress)
    const [quests, setQuests] = useState<AchievementDefinitionWithProgress[]>(
        [],
    );
    const [questsLoading, setQuestsLoading] = useState(false);

    // Level-up animation state
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [newLevel, setNewLevel] = useState<number | null>(null);

    // Achievement popup state
    const [selectedAchievement, setSelectedAchievement] = useState<
        string | null
    >(null);
    const previousLevelRef = useRef<number | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            // Trigger welcome tutorial for new users
            triggerTutorial('welcome');
        }
    }, [status, router, triggerTutorial]);

    // Load achievements
    const loadAchievements = useCallback(async () => {
        if (status !== 'authenticated') return;

        try {
            setAchievementsLoading(true);
            const result = await getXpStatus();
            if (result.success && result.data) {
                // Check for level up
                if (
                    previousLevelRef.current !== null &&
                    result.data.level > previousLevelRef.current
                ) {
                    setNewLevel(result.data.level);
                    setShowLevelUp(true);
                    // Auto-hide after 4 seconds
                    setTimeout(() => setShowLevelUp(false), 4000);
                }
                previousLevelRef.current = result.data.level;
                setXpStatus(result.data);
            } else {
                // Set default empty state if API fails
                setXpStatus({
                    xp: 0,
                    level: 1,
                    currentLevelXp: 0,
                    nextLevelXp: 300,
                    progressXp: 0,
                    progressPercent: 0,
                    xpPerLevel: 300,
                    displayRange: '0-300',
                    achievements: [],
                    badges: [],
                    currentBadge: null,
                    dailyChallenges: {
                        available: [],
                        completedToday: 0,
                        maxDaily: 3,
                    },
                });
            }
        } catch (error) {
            console.error('Error loading achievements:', error);
            // Set default empty state on error
            setXpStatus({
                xp: 0,
                level: 1,
                currentLevelXp: 0,
                nextLevelXp: 300,
                progressXp: 0,
                progressPercent: 0,
                xpPerLevel: 300,
                displayRange: '0-300',
                achievements: [],
                badges: [],
                currentBadge: null,
                dailyChallenges: {
                    available: [],
                    completedToday: 0,
                    maxDaily: 3,
                },
            });
        } finally {
            setAchievementsLoading(false);
        }
    }, [status]);

    // Load achievements on mount and when session changes
    useEffect(() => {
        loadAchievements();
    }, [loadAchievements]);

    // Load quests (achievement definitions with progress)
    const loadQuests = useCallback(async () => {
        if (status !== 'authenticated') return;

        try {
            setQuestsLoading(true);
            const result = await getAchievementDefinitionsWithProgress();
            if (result.success && result.data) {
                setQuests(result.data);
            }
        } catch (error) {
            console.error('Error loading quests:', error);
        } finally {
            setQuestsLoading(false);
        }
    }, [status]);

    // Load quests on mount
    useEffect(() => {
        loadQuests();
    }, [loadQuests]);

    // Handle achievement redemption
    const handleRedeemAchievement = async (achievementId: string) => {
        setRedeemingId(achievementId);
        try {
            const result = await redeemAchievement(achievementId);
            if (result.success) {
                toast.success('Achievement redeemed! 🎉');
                loadAchievements(); // Refresh achievements
            } else {
                toast.error(result.error || 'Failed to redeem achievement');
            }
        } catch {
            toast.error('Failed to redeem achievement');
        } finally {
            setRedeemingId(null);
        }
    };

    // Get time-based greeting
    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    }, []);

    const stats = {
        totalApplications: 24,
        interviewsScheduled: 3,
        offersReceived: 1,
    };

    // Map achievement keys to links and icons
    const questConfig: Record<
        string,
        { link: string; icon: typeof Briefcase }
    > = {
        APPLICATION_ACE: { link: '/applied-jobs/grid', icon: ClipboardCheck },
        INTERVIEW_TRAILBLAZER: { link: '/applied-jobs/kanban', icon: Target },
        PROFILE_PIONEER: { link: '/profile', icon: User },
        WORK_STARTER: { link: '/profile', icon: Briefcase },
        CAREER_CLIMBER: { link: '/profile', icon: TrendingUp },
        LAUNCHPAD: { link: '/profile', icon: Rocket },
        PROJECT_BUILDER: { link: '/profile', icon: Wrench },
        SKILL_COLLECTOR: { link: '/profile', icon: GraduationCap },
        SKILL_MASTER: { link: '/profile', icon: Trophy },
        RESUME_ARCHIVIST: { link: '/resume-builder', icon: FileText },
        THOUGHT_LEADER: { link: '/community', icon: MessageSquare },
        COMMUNITY_VOICE: { link: '/community', icon: MessageSquare },
        CONNECTOR: { link: '/community', icon: Users },
        DAILY_SPARK_A: { link: '/', icon: Zap },
        DAILY_SPARK_B: { link: '/', icon: Zap },
        DAILY_SPARK_C: { link: '/', icon: Zap },
    };

    // Filter quests to show: not fully earned OR in progress
    const activeQuests = useMemo(() => {
        return quests
            .filter(q => !q.earned || (q.progress?.percent ?? 0) < 100)
            .slice(0, 5); // Show max 5 quests
    }, [quests]);

    const completedQuestsCount = useMemo(() => {
        return quests.filter(q => q.earned && (q.progress?.percent ?? 0) >= 100)
            .length;
    }, [quests]);

    const upcomingInterviews = [
        {
            id: '1',
            company: 'Tech Corp',
            position: 'Senior Developer',
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            time: '2:00 PM',
        },
        {
            id: '2',
            company: 'StartupXYZ',
            position: 'Full Stack Engineer',
            date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            time: '10:00 AM',
        },
    ];

    // Timeline activity
    const recentActivity = [
        {
            id: '1',
            action: 'Applied to Frontend Developer',
            company: 'Google',
            time: '2h ago',
            type: 'application',
            icon: Briefcase,
        },
        {
            id: '2',
            action: 'Interview scheduled',
            company: 'Microsoft',
            time: '5h ago',
            type: 'interview',
            icon: Calendar,
        },
        {
            id: '3',
            action: 'CV updated',
            company: '',
            time: '1d ago',
            type: 'cv',
            icon: FileText,
        },
        {
            id: '4',
            action: 'Reached interview stage',
            company: 'Amazon',
            time: '2d ago',
            type: 'status',
            icon: TrendingUp,
        },
    ];

    if (status === 'loading') {
        return <LoadingSkeleton />;
    }

    if (!session) {
        return null;
    }

    const getDaysUntil = (date: Date) => {
        const days = Math.ceil(
            (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );
        if (days === 0) return 'Today';
        if (days === 1) return 'Tomorrow';
        return `${days} days`;
    };

    // Helper to format time ago
    const getTimeAgo = (date: Date) => {
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);

        if (months > 0) return `${months}mo ago`;
        if (weeks > 0) return `${weeks}w ago`;
        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    };

    return (
        <div className="space-y-6 h-full" data-tutorial="dashboard">
            {/* Level Up Celebration Modal */}
            {showLevelUp && newLevel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setShowLevelUp(false)}
                    />

                    {/* Celebration content */}
                    <div className="relative z-10 flex flex-col items-center animate-in zoom-in-95 fade-in duration-500">
                        {/* Particle effects */}
                        <div className="absolute inset-0 pointer-events-none">
                            {[...Array(12)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-3 h-3 rounded-full animate-ping"
                                    style={{
                                        left: `${50 + 40 * Math.cos((i * 30 * Math.PI) / 180)}%`,
                                        top: `${50 + 40 * Math.sin((i * 30 * Math.PI) / 180)}%`,
                                        backgroundColor: [
                                            '#cf6318',
                                            '#f59e0b',
                                            '#fbbf24',
                                            '#fcd34d',
                                        ][i % 4],
                                        animationDelay: `${i * 100}ms`,
                                        animationDuration: '1.5s',
                                    }}
                                />
                            ))}
                        </div>

                        {/* Glowing ring */}
                        <div className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-[#cf6318] via-amber-500 to-[#cf6318] opacity-30 blur-3xl animate-pulse" />

                        {/* Level badge */}
                        <div className="relative">
                            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-[#cf6318] via-amber-500 to-orange-600 p-1 shadow-2xl shadow-orange-500/50 animate-bounce">
                                <div className="w-full h-full rounded-full bg-[#1a1a1a] flex flex-col items-center justify-center">
                                    <Crown className="h-10 w-10 text-amber-400 mb-1 animate-pulse" />
                                    <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                                        {newLevel}
                                    </span>
                                </div>
                            </div>

                            {/* Sparkles around the badge */}
                            <Sparkles
                                className="absolute -top-2 -right-2 h-8 w-8 text-amber-400 animate-spin"
                                style={{ animationDuration: '3s' }}
                            />
                            <Star className="absolute -bottom-1 -left-3 h-6 w-6 text-yellow-400 animate-pulse" />
                            <Zap className="absolute top-1/2 -right-6 h-6 w-6 text-orange-400 animate-bounce" />
                        </div>

                        {/* Text */}
                        <div className="mt-6 text-center">
                            <h2 className="text-3xl font-black text-white mb-2 animate-in slide-in-from-bottom-4 duration-500">
                                LEVEL UP!
                            </h2>
                            <p className="text-lg text-amber-400 font-semibold animate-in slide-in-from-bottom-4 duration-700">
                                You&apos;ve reached Level {newLevel}!
                            </p>
                            <p className="text-sm text-white/60 mt-2 animate-in fade-in duration-1000 delay-500">
                                Keep going to unlock more achievements
                            </p>
                        </div>

                        {/* Close button */}
                        <Button
                            onClick={() => setShowLevelUp(false)}
                            className="mt-6 bg-gradient-to-r from-[#cf6318] to-amber-500 hover:from-amber-500 hover:to-[#cf6318] text-white font-semibold px-8 animate-in fade-in duration-1000 delay-700"
                        >
                            Awesome!
                        </Button>
                    </div>
                </div>
            )}

            {/* Welcome Banner with XP Progress */}
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#cf6318]/20 via-[#1a1a1a]/80 to-[#1a1a1a]/60 p-6 backdrop-blur-sm">
                <div className="absolute right-0 top-0 h-32 w-32 bg-[#cf6318]/20 blur-3xl" />
                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white">
                            {greeting}, {session.user?.name?.split(' ')[0]}! 👋
                        </h1>
                        <p className="mt-2 text-sm text-white/60">
                            Keep up the momentum! You&apos;re doing great.
                        </p>
                    </div>

                    {/* XP Level Display */}
                    {xpStatus && (
                        <div
                            className="flex items-center gap-4"
                            data-tutorial="xp"
                        >
                            {/* Level Badge */}
                            <div className="relative group">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#cf6318] to-amber-600 p-0.5 shadow-lg shadow-orange-500/30 transition-transform group-hover:scale-110">
                                    <div className="w-full h-full rounded-full bg-[#1a1a1a] flex flex-col items-center justify-center">
                                        <span className="text-[10px] text-white/60 font-medium">
                                            LVL
                                        </span>
                                        <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                                            {xpStatus.level}
                                        </span>
                                    </div>
                                </div>
                                {/* Glow effect on hover */}
                                <div className="absolute inset-0 rounded-full bg-[#cf6318]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            {/* XP Progress */}
                            <div className="min-w-[140px]">
                                <div className="flex items-center justify-between text-xs mb-1.5">
                                    <span className="text-white/60">
                                        XP Progress
                                    </span>
                                    <span className="text-amber-400 font-semibold">
                                        {xpStatus.progressXp} /{' '}
                                        {xpStatus.xpPerLevel}
                                    </span>
                                </div>
                                <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-[#cf6318] to-amber-500 rounded-full transition-all duration-1000 ease-out relative"
                                        style={{
                                            width: `${xpStatus.progressPercent}%`,
                                        }}
                                    >
                                        {/* Shimmer effect */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                                    </div>
                                </div>
                                <p className="text-[10px] text-white/40 mt-1">
                                    {xpStatus.xpPerLevel - xpStatus.progressXp}{' '}
                                    XP to Level {xpStatus.level + 1}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Stats - Icon Rich */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-[#1a1a1a]/80 p-5 backdrop-blur-sm transition-all hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-white/60">
                                Applications
                            </p>
                            <p className="mt-1 text-3xl font-bold text-white">
                                {stats.totalApplications}
                            </p>
                        </div>
                        <div className="rounded-full bg-blue-500/20 p-3">
                            <Briefcase className="h-6 w-6 text-blue-400" />
                        </div>
                    </div>
                </div>

                <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-green-500/10 to-[#1a1a1a]/80 p-5 backdrop-blur-sm transition-all hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-white/60">Interviews</p>
                            <p className="mt-1 text-3xl font-bold text-white">
                                {stats.interviewsScheduled}
                            </p>
                        </div>
                        <div className="rounded-full bg-green-500/20 p-3">
                            <Calendar className="h-6 w-6 text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-yellow-500/10 to-[#1a1a1a]/80 p-5 backdrop-blur-sm transition-all hover:border-yellow-500/30 hover:shadow-lg hover:shadow-yellow-500/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-white/60">Offers</p>
                            <p className="mt-1 text-3xl font-bold text-white">
                                {stats.offersReceived}
                            </p>
                        </div>
                        <div className="rounded-full bg-yellow-500/20 p-3">
                            <Gift className="h-6 w-6 text-yellow-400" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Quests - Achievement Progress */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-[#cf6318]" />
                                <CardTitle className="text-white">
                                    Quests
                                </CardTitle>
                            </div>
                            <Badge className="bg-[#cf6318]/20 text-[#cf6318] border-[#cf6318]/30">
                                {completedQuestsCount}/{quests.length}
                            </Badge>
                        </div>
                        <CardDescription className="text-white/60">
                            Complete quests to earn XP and unlock achievements
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {questsLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#cf6318]"></div>
                            </div>
                        ) : activeQuests.length > 0 ? (
                            activeQuests.map(quest => {
                                const config = questConfig[quest.key] || {
                                    link: '/',
                                    icon: Award,
                                };
                                const Icon = config.icon;
                                const progress = quest.progress || {
                                    current: 0,
                                    target: 1,
                                    percent: 0,
                                };
                                const isCompleted =
                                    quest.earned && progress.percent >= 100;

                                return (
                                    <Link
                                        key={quest.id}
                                        href={config.link}
                                        className={`group block rounded-lg border p-4 transition-all ${
                                            isCompleted
                                                ? 'border-green-500/30 bg-green-500/5'
                                                : 'border-white/10 bg-white/5 hover:border-[#cf6318]/30 hover:bg-white/10'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex min-w-0 flex-1 items-start gap-3">
                                                <div
                                                    className={`rounded-lg p-2 ${
                                                        isCompleted
                                                            ? 'bg-green-500/20'
                                                            : 'bg-[#cf6318]/20'
                                                    }`}
                                                >
                                                    <Icon
                                                        className={`h-4 w-4 ${
                                                            isCompleted
                                                                ? 'text-green-400'
                                                                : 'text-[#cf6318]'
                                                        }`}
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-white">
                                                            {quest.title}
                                                        </p>
                                                        {isCompleted && (
                                                            <CheckCircle2 className="h-4 w-4 text-green-400" />
                                                        )}
                                                    </div>
                                                    {quest.description && (
                                                        <p className="text-xs text-white/50 mt-0.5 line-clamp-1">
                                                            {quest.description}
                                                        </p>
                                                    )}
                                                    <div className="mt-2 space-y-1">
                                                        <Progress
                                                            value={
                                                                progress.percent
                                                            }
                                                            className="h-1.5"
                                                        />
                                                        <p className="text-xs text-white/40">
                                                            {progress.current}/
                                                            {progress.target}{' '}
                                                            completed
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div
                                                className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-1 ${
                                                    isCompleted
                                                        ? 'bg-green-500/20'
                                                        : 'bg-[#cf6318]/20'
                                                }`}
                                            >
                                                <Zap
                                                    className={`h-3.5 w-3.5 ${
                                                        isCompleted
                                                            ? 'text-green-400'
                                                            : 'text-[#cf6318]'
                                                    }`}
                                                />
                                                <span
                                                    className={`text-sm font-semibold ${
                                                        isCompleted
                                                            ? 'text-green-400'
                                                            : 'text-[#cf6318]'
                                                    }`}
                                                >
                                                    +{quest.xpReward}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/5 flex items-center justify-center">
                                    <Trophy className="w-6 h-6 text-white/30" />
                                </div>
                                <p className="text-white/60 font-medium">
                                    All quests completed!
                                </p>
                                <p className="text-sm text-white/40 mt-1">
                                    You&apos;re a superstar! 🌟
                                </p>
                            </div>
                        )}

                        {/* View all quests link */}
                        {quests.length > 5 && (
                            <div className="pt-2 border-t border-white/10">
                                <p className="text-xs text-white/40 text-center">
                                    Showing {activeQuests.length} of{' '}
                                    {quests.length} quests
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Achievements & Badges */}
                <Card className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-amber-500/10 to-orange-500/5 border-b border-white/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-amber-500/20">
                                    <Award className="h-5 w-5 text-amber-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-white">
                                        Achievements
                                    </CardTitle>
                                    <CardDescription className="text-white/60">
                                        Earn achievements as you progress in
                                        your career journey
                                    </CardDescription>
                                </div>
                            </div>
                            {xpStatus &&
                                xpStatus.achievements &&
                                xpStatus.achievements.length > 0 && (
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-amber-400">
                                            {
                                                xpStatus.achievements.filter(
                                                    a => !a.claimed,
                                                ).length
                                            }
                                        </p>
                                        <p className="text-xs text-white/50">
                                            to claim
                                        </p>
                                    </div>
                                )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-4">
                        {achievementsLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#cf6318]"></div>
                            </div>
                        ) : xpStatus &&
                          xpStatus.achievements &&
                          xpStatus.achievements.length > 0 ? (
                            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                {/* Unclaimed achievements first */}
                                {xpStatus.achievements
                                    .sort((a, b) => {
                                        // Unclaimed first, then by awardedAt desc
                                        if (a.claimed !== b.claimed)
                                            return a.claimed ? 1 : -1;
                                        return (
                                            new Date(b.awardedAt).getTime() -
                                            new Date(a.awardedAt).getTime()
                                        );
                                    })
                                    .map(achievement => {
                                        const awardedDate = new Date(
                                            achievement.awardedAt,
                                        );
                                        const timeAgo = getTimeAgo(awardedDate);
                                        const categoryColors: Record<
                                            string,
                                            string
                                        > = {
                                            CAREER: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
                                            PROFILE:
                                                'from-purple-500/20 to-purple-600/10 border-purple-500/30',
                                            COMMUNITY:
                                                'from-green-500/20 to-green-600/10 border-green-500/30',
                                            CV: 'from-pink-500/20 to-pink-600/10 border-pink-500/30',
                                            DAILY: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
                                            GENERAL:
                                                'from-amber-500/20 to-orange-500/10 border-amber-500/30',
                                        };
                                        const categoryColor =
                                            categoryColors[
                                                achievement.category
                                            ] || categoryColors.GENERAL;

                                        // Get icon info for this achievement
                                        const achievementIcons: Record<
                                            string,
                                            LucideIcon
                                        > = {
                                            DAILY_SPARK_A: Zap,
                                            DAILY_SPARK_B: Zap,
                                            DAILY_SPARK_C: Zap,
                                            APPLICATION_ACE: ClipboardCheck,
                                            INTERVIEW_TRAILBLAZER: Target,
                                            PROFILE_PIONEER: User,
                                            WORK_STARTER: Briefcase,
                                            CAREER_CLIMBER: TrendingUp,
                                            LAUNCHPAD: Rocket,
                                            PROJECT_BUILDER: Wrench,
                                            SKILL_COLLECTOR: GraduationCap,
                                            SKILL_MASTER: Trophy,
                                        };
                                        const categoryIcons: Record<
                                            string,
                                            LucideIcon
                                        > = {
                                            CAREER: Briefcase,
                                            PROFILE: UserCheck,
                                            COMMUNITY: Users,
                                            CV: FileText,
                                            DAILY: Zap,
                                            GENERAL: Award,
                                        };
                                        const categoryIconColors: Record<
                                            string,
                                            string
                                        > = {
                                            CAREER: 'text-blue-400',
                                            PROFILE: 'text-purple-400',
                                            COMMUNITY: 'text-green-400',
                                            CV: 'text-pink-400',
                                            DAILY: 'text-yellow-400',
                                            GENERAL: 'text-amber-400',
                                        };
                                        const categoryBgColors: Record<
                                            string,
                                            string
                                        > = {
                                            CAREER: 'from-blue-500/30 to-blue-600/20',
                                            PROFILE:
                                                'from-purple-500/30 to-purple-600/20',
                                            COMMUNITY:
                                                'from-green-500/30 to-green-600/20',
                                            CV: 'from-pink-500/30 to-pink-600/20',
                                            DAILY: 'from-yellow-500/30 to-yellow-600/20',
                                            GENERAL:
                                                'from-amber-500/30 to-orange-500/20',
                                        };

                                        const achievementKey =
                                            achievement.key || '';
                                        const IconComponent =
                                            achievementIcons[achievementKey] ||
                                            categoryIcons[
                                                achievement.category
                                            ] ||
                                            Award;
                                        const iconColor =
                                            categoryIconColors[
                                                achievement.category
                                            ] || 'text-amber-400';
                                        const bgColor =
                                            categoryBgColors[
                                                achievement.category
                                            ] ||
                                            'from-amber-500/30 to-orange-500/20';

                                        return (
                                            <Popover
                                                key={achievement.id}
                                                open={
                                                    selectedAchievement ===
                                                    achievement.id
                                                }
                                                onOpenChange={open =>
                                                    setSelectedAchievement(
                                                        open
                                                            ? achievement.id
                                                            : null,
                                                    )
                                                }
                                            >
                                                <PopoverTrigger asChild>
                                                    <div
                                                        className={`group relative p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                                                            achievement.claimed
                                                                ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                                                : `bg-gradient-to-r ${categoryColor} hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/10`
                                                        }`}
                                                    >
                                                        {/* Glow effect for unclaimed */}
                                                        {!achievement.claimed && (
                                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        )}

                                                        <div className="relative flex items-center gap-3">
                                                            {/* Icon */}
                                                            <div
                                                                className={`relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                                                                    achievement.claimed
                                                                        ? 'bg-white/10'
                                                                        : `bg-gradient-to-br ${bgColor}`
                                                                }`}
                                                            >
                                                                <IconComponent
                                                                    className={`h-6 w-6 ${achievement.claimed ? 'text-white/50' : iconColor}`}
                                                                />
                                                                {!achievement.claimed && (
                                                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                                                                    </span>
                                                                )}
                                                            </div>

                                                            {/* Title and XP */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2">
                                                                    <p
                                                                        className={`font-semibold truncate ${achievement.claimed ? 'text-white/70' : 'text-white'}`}
                                                                    >
                                                                        {
                                                                            achievement.title
                                                                        }
                                                                    </p>
                                                                    {achievement.earnCount >
                                                                        1 && (
                                                                        <Badge
                                                                            variant="secondary"
                                                                            className="text-[10px] h-5 bg-white/10 text-white/70 flex-shrink-0"
                                                                        >
                                                                            x
                                                                            {
                                                                                achievement.earnCount
                                                                            }
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <div
                                                                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                                                                            achievement.claimed
                                                                                ? 'bg-green-500/20 text-green-400'
                                                                                : 'bg-amber-500/20 text-amber-400'
                                                                        }`}
                                                                    >
                                                                        <Zap className="h-3 w-3" />
                                                                        <span className="font-semibold">
                                                                            +
                                                                            {
                                                                                achievement.xpReward
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    {achievement.claimed && (
                                                                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </PopoverTrigger>

                                                {/* Achievement Detail Popover */}
                                                <PopoverContent
                                                    className="w-80 p-0 bg-[#1a1a1a]/95 backdrop-blur-xl border-white/10"
                                                    side="right"
                                                    align="start"
                                                >
                                                    <div
                                                        className={`p-4 border-b border-white/10 bg-gradient-to-r ${categoryColor}`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${bgColor}`}
                                                            >
                                                                <IconComponent
                                                                    className={`h-7 w-7 ${iconColor}`}
                                                                />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-white text-lg">
                                                                    {
                                                                        achievement.title
                                                                    }
                                                                </h3>
                                                                <Badge
                                                                    variant="outline"
                                                                    className="text-[10px] mt-1 border-white/20 text-white/60"
                                                                >
                                                                    {
                                                                        achievement.category
                                                                    }
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="p-4 space-y-4">
                                                        {/* Description */}
                                                        {achievement.description && (
                                                            <p className="text-sm text-white/70 leading-relaxed">
                                                                {
                                                                    achievement.description
                                                                }
                                                            </p>
                                                        )}

                                                        {/* Stats */}
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="bg-white/5 rounded-lg p-3">
                                                                <p className="text-[10px] text-white/40 uppercase tracking-wider">
                                                                    XP Reward
                                                                </p>
                                                                <div className="flex items-center gap-1 mt-1">
                                                                    <Zap className="h-4 w-4 text-amber-400" />
                                                                    <span className="font-bold text-amber-400">
                                                                        +
                                                                        {
                                                                            achievement.xpReward
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="bg-white/5 rounded-lg p-3">
                                                                <p className="text-[10px] text-white/40 uppercase tracking-wider">
                                                                    Earned
                                                                </p>
                                                                <div className="flex items-center gap-1 mt-1">
                                                                    <Clock className="h-4 w-4 text-white/60" />
                                                                    <span className="font-semibold text-white/80">
                                                                        {
                                                                            timeAgo
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {achievement.earnCount >
                                                            1 && (
                                                            <div className="bg-white/5 rounded-lg p-3">
                                                                <p className="text-[10px] text-white/40 uppercase tracking-wider">
                                                                    Times Earned
                                                                </p>
                                                                <div className="flex items-center gap-1 mt-1">
                                                                    <Medal className="h-4 w-4 text-purple-400" />
                                                                    <span className="font-bold text-white">
                                                                        {
                                                                            achievement.earnCount
                                                                        }
                                                                        x
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Status */}
                                                        <div
                                                            className={`flex items-center gap-2 p-3 rounded-lg ${
                                                                achievement.claimed
                                                                    ? 'bg-green-500/10'
                                                                    : 'bg-amber-500/10'
                                                            }`}
                                                        >
                                                            {achievement.claimed ? (
                                                                <>
                                                                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                                                                    <span className="text-sm font-medium text-green-400">
                                                                        Claimed
                                                                        &
                                                                        Redeemed
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Sparkles className="h-5 w-5 text-amber-400" />
                                                                    <span className="text-sm font-medium text-amber-400">
                                                                        Ready to
                                                                        Claim!
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>

                                                        {/* Claim button in popover */}
                                                        {!achievement.claimed && (
                                                            <Button
                                                                size="sm"
                                                                className="w-full h-10 bg-gradient-to-r from-[#cf6318] to-[#e67320] hover:from-[#e67320] hover:to-[#cf6318] text-white font-semibold shadow-lg shadow-orange-500/20 transition-all duration-300"
                                                                onClick={e => {
                                                                    e.stopPropagation();
                                                                    handleRedeemAchievement(
                                                                        achievement.id,
                                                                    );
                                                                    setSelectedAchievement(
                                                                        null,
                                                                    );
                                                                }}
                                                                disabled={
                                                                    redeemingId ===
                                                                    achievement.id
                                                                }
                                                            >
                                                                {redeemingId ===
                                                                achievement.id ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                                                                        <span>
                                                                            Claiming...
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-2">
                                                                        <Gift className="h-4 w-4" />
                                                                        <span>
                                                                            Claim
                                                                            +
                                                                            {
                                                                                achievement.xpReward
                                                                            }{' '}
                                                                            XP
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        );
                                    })}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                                    <Award className="w-8 h-8 text-white/30" />
                                </div>
                                <p className="text-white/60 font-medium">
                                    No achievements yet
                                </p>
                                <p className="text-sm text-white/40 mt-1">
                                    Start your journey to unlock achievements!
                                </p>
                            </div>
                        )}

                        {/* Summary footer */}
                        {xpStatus &&
                            xpStatus.achievements &&
                            xpStatus.achievements.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-4">
                                            <span className="text-white/40">
                                                <span className="text-green-400 font-semibold">
                                                    {
                                                        xpStatus.achievements.filter(
                                                            a => a.claimed,
                                                        ).length
                                                    }
                                                </span>{' '}
                                                claimed
                                            </span>
                                            <span className="text-white/40">
                                                <span className="text-amber-400 font-semibold">
                                                    {
                                                        xpStatus.achievements.filter(
                                                            a => !a.claimed,
                                                        ).length
                                                    }
                                                </span>{' '}
                                                pending
                                            </span>
                                        </div>
                                        <span className="text-white/40">
                                            Total:{' '}
                                            <span className="text-white font-semibold">
                                                {xpStatus.achievements.reduce(
                                                    (acc, a) =>
                                                        acc +
                                                        (a.claimed
                                                            ? a.xpReward
                                                            : 0),
                                                    0,
                                                )}{' '}
                                                XP
                                            </span>{' '}
                                            earned
                                        </span>
                                    </div>
                                </div>
                            )}
                    </CardContent>
                </Card>
            </div>

            {/* Activity Timeline & Upcoming */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Activity Timeline */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-white">
                            Recent Activity
                        </CardTitle>
                        <CardDescription className="text-white/60">
                            Your latest achievements
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative space-y-4 before:absolute before:left-[15px] before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-white/10">
                            {recentActivity.map(activity => {
                                const Icon = activity.icon;
                                return (
                                    <div
                                        key={activity.id}
                                        className="relative flex gap-4"
                                    >
                                        <div className="relative z-10 rounded-full bg-[#cf6318]/20 p-2">
                                            <Icon className="h-4 w-4 text-[#cf6318]" />
                                        </div>
                                        <div className="flex-1 pt-0.5">
                                            <p className="text-sm font-medium text-white">
                                                {activity.action}
                                            </p>
                                            {activity.company && (
                                                <p className="text-sm text-[#cf6318]">
                                                    {activity.company}
                                                </p>
                                            )}
                                            <p className="text-xs text-white/40">
                                                {activity.time}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Upcoming Interviews */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-white">
                                    Upcoming Interviews
                                </CardTitle>
                                <CardDescription className="text-white/60">
                                    Prepare and ace them!
                                </CardDescription>
                            </div>
                            <Link href="/applied-jobs/calendar">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-[#cf6318] hover:bg-[#cf6318]/10 hover:text-[#e67320]"
                                >
                                    View All
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {upcomingInterviews.length > 0 ? (
                                upcomingInterviews.map(interview => (
                                    <div
                                        key={interview.id}
                                        className="rounded-lg border border-white/10 bg-white/5 p-4"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-semibold text-white">
                                                    {interview.company}
                                                </p>
                                                <p className="text-sm text-white/60">
                                                    {interview.position}
                                                </p>
                                                <div className="mt-2 flex items-center gap-2 text-sm text-white/60">
                                                    <Clock className="h-4 w-4" />
                                                    <span>
                                                        {interview.time}
                                                    </span>
                                                </div>
                                            </div>
                                            <Badge className="shrink-0 bg-[#10b981]/20 text-[#10b981] border-[#10b981]/30">
                                                {getDaysUntil(interview.date)}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center">
                                    <Calendar className="mx-auto h-12 w-12 text-white/20" />
                                    <p className="mt-3 text-sm text-white/40">
                                        No upcoming interviews
                                    </p>
                                    <Link href="/applied-jobs/grid">
                                        <Button className="mt-4 bg-[#cf6318] text-white hover:bg-[#b55416]">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Apply to Jobs
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions Footer */}
            <div className="flex flex-wrap items-center justify-center gap-3">
                <Link href="/applied-jobs/grid">
                    <Button className="bg-gradient-to-r from-[#cf6318] to-[#e67320] text-white hover:opacity-90">
                        <Plus className="mr-2 h-4 w-4" />
                        New Application
                    </Button>
                </Link>
                <Link href="/resume-builder">
                    <Button
                        variant="outline"
                        className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        Update CV
                    </Button>
                </Link>
                <Link href="/applied-jobs/calendar">
                    <Button
                        variant="outline"
                        className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                    >
                        <Calendar className="mr-2 h-4 w-4" />
                        View Calendar
                    </Button>
                </Link>
            </div>
        </div>
    );
}
