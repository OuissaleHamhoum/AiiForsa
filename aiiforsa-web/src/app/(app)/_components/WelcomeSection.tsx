import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Trophy } from 'lucide-react';

interface WelcomeSectionProps {
    greeting: string;
    session: any;
    userLevel: number;
    currentXP: number;
    nextLevelXP: number;
    streak: number;
}

export function WelcomeSection({
    greeting,
    session,
    userLevel,
    currentXP,
    nextLevelXP,
    streak,
}: WelcomeSectionProps) {
    const xpProgress = (currentXP / nextLevelXP) * 100;

    return (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-white lg:text-4xl">
                    {greeting}, {session?.user?.name || 'User'}! 👋
                </h1>
                <p className="text-lg text-white/70">
                    Ready to level up your job search game? Let&apos;s crush
                    those applications!
                </p>
            </div>

            <Card className="lg:min-w-[320px]">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="relative">
                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#cf6318] to-[#e67320] flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                                {session?.user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#cf6318] to-[#e67320] border-2 border-[#0a0a0a] shadow-lg">
                                <span className="text-xs font-black text-white">
                                    {userLevel}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-white/70">
                                    Level {userLevel}
                                </span>
                                <Badge
                                    variant="secondary"
                                    className="bg-[#cf6318]/20 text-[#cf6318] border-[#cf6318]/30"
                                >
                                    {currentXP}/{nextLevelXP} XP
                                </Badge>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs text-white/60">
                                    <span>
                                        Progress to Level {userLevel + 1}
                                    </span>
                                    <span>{Math.round(xpProgress)}%</span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-white/10">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-[#cf6318] to-[#e67320] transition-all duration-500"
                                        style={{ width: `${xpProgress}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1 text-orange-400">
                                    <Flame className="h-4 w-4" />
                                    <span className="font-medium">
                                        {streak} day streak
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-yellow-400">
                                    <Trophy className="h-4 w-4" />
                                    <span className="font-medium">
                                        12 achievements
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
