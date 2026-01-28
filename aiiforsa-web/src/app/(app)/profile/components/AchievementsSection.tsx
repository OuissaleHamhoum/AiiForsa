'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Award, CheckCircle2, Lock, Star, Trophy } from 'lucide-react';

export function AchievementsSection() {
    const achievements = [
        {
            id: '1',
            name: 'First Application',
            description: 'Submit your first job application',
            icon: Award,
            color: 'from-blue-500 to-blue-600',
            unlocked: true,
            progress: 100,
            xpReward: 50,
            unlockedDate: 'Jan 15, 2024',
            rarity: 'Common',
        },
        {
            id: '2',
            name: 'Interview Master',
            description: 'Complete 10 interviews successfully',
            icon: Trophy,
            color: 'from-yellow-500 to-yellow-600',
            unlocked: true,
            progress: 100,
            xpReward: 200,
            unlockedDate: 'Feb 20, 2024',
            rarity: 'Rare',
        },
        {
            id: '3',
            name: 'Streak Champion',
            description: 'Maintain a 7-day login streak',
            icon: Star,
            color: 'from-orange-500 to-red-500',
            unlocked: true,
            progress: 100,
            xpReward: 150,
            unlockedDate: 'Mar 5, 2024',
            rarity: 'Epic',
        },
        {
            id: '4',
            name: 'Network Builder',
            description: 'Connect with 50 professionals',
            icon: Award,
            color: 'from-purple-500 to-pink-500',
            unlocked: false,
            progress: 68,
            xpReward: 300,
            unlockedDate: null,
            rarity: 'Rare',
        },
        {
            id: '5',
            name: 'Resume Expert',
            description: 'Get your resume viewed 100 times',
            icon: Trophy,
            color: 'from-green-500 to-emerald-600',
            unlocked: false,
            progress: 42,
            xpReward: 250,
            unlockedDate: null,
            rarity: 'Epic',
        },
        {
            id: '6',
            name: 'Job Hunter',
            description: 'Apply to 50 different positions',
            icon: Star,
            color: 'from-cyan-500 to-blue-500',
            unlocked: false,
            progress: 24,
            xpReward: 400,
            unlockedDate: null,
            rarity: 'Legendary',
        },
    ];

    const stats = {
        total: achievements.length,
        unlocked: achievements.filter(a => a.unlocked).length,
        totalXP: achievements
            .filter(a => a.unlocked)
            .reduce((sum, a) => sum + a.xpReward, 0),
        completion: Math.round(
            (achievements.filter(a => a.unlocked).length /
                achievements.length) *
                100,
        ),
    };

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'Common':
                return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
            case 'Rare':
                return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
            case 'Epic':
                return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
            case 'Legendary':
                return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
            default:
                return 'text-white/60 bg-white/10 border-white/20';
        }
    };

    return (
        <Card>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[#e67320]/20 to-transparent rounded-full blur-3xl" />

            <div className="relative p-6 space-y-6">
                {/* Header with Stats */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-white flex items-center gap-3">
                            <div className="w-1.5 h-8 bg-gradient-to-b from-[#cf6318] to-[#e67320] rounded-full" />
                            Achievements
                        </h2>
                        <span className="text-sm font-bold text-white/60">
                            {stats.unlocked}/{stats.total} Unlocked
                        </span>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-gradient-to-br from-[#cf6318]/20 to-[#e67320]/20 border border-[#cf6318]/30">
                            <p className="text-sm text-white/60">Completion</p>
                            <p className="text-2xl font-black text-white">
                                {stats.completion}%
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                            <p className="text-sm text-white/60">
                                Total XP Earned
                            </p>
                            <p className="text-2xl font-black text-white">
                                {stats.totalXP}
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                            <p className="text-sm text-white/60">Unlocked</p>
                            <p className="text-2xl font-black text-white">
                                {stats.unlocked}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Achievements Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map(achievement => {
                        const Icon = achievement.icon;
                        return (
                            <div
                                key={achievement.id}
                                className={`group relative overflow-hidden rounded-xl border p-4 transition-all duration-300 cursor-pointer ${
                                    achievement.unlocked
                                        ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#cf6318]/50 hover:scale-[1.02]'
                                        : 'bg-white/[0.02] border-white/5 opacity-70 hover:opacity-90'
                                }`}
                            >
                                {/* Hover Gradient */}
                                {achievement.unlocked && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}

                                <div className="relative space-y-3">
                                    {/* Header */}
                                    <div className="flex items-start gap-3">
                                        {/* Icon */}
                                        <div
                                            className={`relative w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                                                achievement.unlocked
                                                    ? `bg-gradient-to-br ${achievement.color} group-hover:scale-110`
                                                    : 'bg-white/10'
                                            }`}
                                        >
                                            {achievement.unlocked ? (
                                                <Icon className="w-7 h-7 text-white drop-shadow-lg" />
                                            ) : (
                                                <Lock className="w-7 h-7 text-white/40" />
                                            )}
                                            {achievement.unlocked && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center border-2 border-[#0a0a0a]">
                                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3
                                                    className={`font-bold ${
                                                        achievement.unlocked
                                                            ? 'text-white'
                                                            : 'text-white/60'
                                                    }`}
                                                >
                                                    {achievement.name}
                                                </h3>
                                                <Badge
                                                    className={`${getRarityColor(achievement.rarity)} border text-xs`}
                                                >
                                                    {achievement.rarity}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-white/60">
                                                {achievement.description}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="space-y-1.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-white/60">
                                                Progress
                                            </span>
                                            <span className="font-bold text-white/80">
                                                {achievement.progress}%
                                            </span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    achievement.unlocked
                                                        ? `bg-gradient-to-r ${achievement.color}`
                                                        : 'bg-white/20'
                                                }`}
                                                style={{
                                                    width: `${achievement.progress}%`,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                        <div className="flex items-center gap-1.5 text-xs text-yellow-400">
                                            <Star className="w-3.5 h-3.5" />
                                            <span className="font-bold">
                                                +{achievement.xpReward} XP
                                            </span>
                                        </div>
                                        {achievement.unlocked &&
                                            achievement.unlockedDate && (
                                                <span className="text-xs text-white/50">
                                                    {achievement.unlockedDate}
                                                </span>
                                            )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Card>
    );
}
