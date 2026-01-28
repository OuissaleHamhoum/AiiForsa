'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Award,
    CheckCircle2,
    Crown,
    Lock,
    Star,
    Target,
    Trophy,
    Zap,
} from 'lucide-react';
import Link from 'next/link';
import { ProfileHeader } from '../components/ProfileHeader';

export default function AchievementsPage() {
    const achievements = [
        {
            id: '1',
            title: 'First Application',
            description: 'Submit your first job application',
            icon: Target,
            rarity: 'Common',
            rarityColor: 'from-gray-500 to-gray-600',
            progress: 100,
            unlocked: true,
            xp: 50,
            unlockedDate: 'Oct 15, 2024',
        },
        {
            id: '2',
            title: 'Interview Pro',
            description: 'Complete 10 interviews successfully',
            icon: Award,
            rarity: 'Rare',
            rarityColor: 'from-blue-500 to-blue-600',
            progress: 100,
            unlocked: true,
            xp: 150,
            unlockedDate: 'Oct 28, 2024',
        },
        {
            id: '3',
            title: 'Streak Master',
            description: 'Maintain a 7-day login streak',
            icon: Zap,
            rarity: 'Epic',
            rarityColor: 'from-purple-500 to-pink-500',
            progress: 100,
            unlocked: true,
            xp: 200,
            unlockedDate: 'Nov 3, 2024',
        },
        {
            id: '4',
            title: 'Network King',
            description: 'Connect with 100+ professionals',
            icon: Crown,
            rarity: 'Legendary',
            rarityColor: 'from-orange-500 to-red-500',
            progress: 60,
            unlocked: false,
            xp: 400,
        },
        {
            id: '5',
            title: 'Resume Expert',
            description: 'Complete and optimize your resume',
            icon: Star,
            rarity: 'Common',
            rarityColor: 'from-gray-500 to-gray-600',
            progress: 40,
            unlocked: false,
            xp: 50,
        },
        {
            id: '6',
            title: 'Job Hunter',
            description: 'Apply to 50+ positions',
            icon: Trophy,
            rarity: 'Epic',
            rarityColor: 'from-purple-500 to-pink-500',
            progress: 24,
            unlocked: false,
            xp: 250,
        },
    ];

    const stats = {
        totalAchievements: achievements.length,
        unlockedAchievements: achievements.filter(a => a.unlocked).length,
        totalXP: achievements
            .filter(a => a.unlocked)
            .reduce((sum, a) => sum + a.xp, 0),
        completionPercentage: Math.round(
            (achievements.filter(a => a.unlocked).length /
                achievements.length) *
                100,
        ),
    };

    return (
        <div className="py-8 space-y-8 max-w-7xl mx-auto">
            {/* Profile Header */}
            <ProfileHeader />

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-white/60">
                <Link
                    href="/profile"
                    className="hover:text-white transition-colors"
                >
                    Profile
                </Link>
                <span>/</span>
                <span className="text-white">Achievements</span>
            </div>

            {/* Page Title & Stats */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-white mb-2">
                            Achievements
                        </h1>
                        <p className="text-white/60">
                            Track your progress and unlock rewards
                        </p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Card className="bg-gradient-to-br from-[#0a0a0a] to-[#0a0a0a]/80 border border-white/10 p-4">
                        <div className="space-y-1">
                            <p className="text-xs text-white/50 uppercase tracking-wide">
                                Completion
                            </p>
                            <p className="text-2xl font-black text-white">
                                {stats.completionPercentage}%
                            </p>
                        </div>
                    </Card>
                    <Card className="bg-gradient-to-br from-[#0a0a0a] to-[#0a0a0a]/80 border border-white/10 p-4">
                        <div className="space-y-1">
                            <p className="text-xs text-white/50 uppercase tracking-wide">
                                Total XP
                            </p>
                            <p className="text-2xl font-black text-white">
                                {stats.totalXP}
                            </p>
                        </div>
                    </Card>
                    <Card className="bg-gradient-to-br from-[#0a0a0a] to-[#0a0a0a]/80 border border-white/10 p-4">
                        <div className="space-y-1">
                            <p className="text-xs text-white/50 uppercase tracking-wide">
                                Unlocked
                            </p>
                            <p className="text-2xl font-black text-white">
                                {stats.unlockedAchievements}/
                                {stats.totalAchievements}
                            </p>
                        </div>
                    </Card>
                    <Card className="bg-gradient-to-br from-[#0a0a0a] to-[#0a0a0a]/80 border border-white/10 p-4">
                        <div className="space-y-1">
                            <p className="text-xs text-white/50 uppercase tracking-wide">
                                Rank
                            </p>
                            <p className="text-2xl font-black text-white">
                                Diamond
                            </p>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Achievements Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map(achievement => {
                    const Icon = achievement.icon;
                    const isUnlocked = achievement.unlocked;

                    return (
                        <Card
                            key={achievement.id}
                            className={`group relative overflow-hidden border transition-all duration-300 ${
                                isUnlocked
                                    ? 'bg-gradient-to-br from-[#0a0a0a] to-[#0a0a0a]/80 border-white/10 hover:border-[#cf6318]/50'
                                    : 'bg-[#0a0a0a]/30 border-white/5 opacity-60'
                            }`}
                        >
                            {/* Background Effect */}
                            <div
                                className={`absolute inset-0 bg-gradient-to-br ${achievement.rarityColor} ${isUnlocked ? 'opacity-10' : 'opacity-5'} group-hover:opacity-20 transition-opacity`}
                            />

                            <div className="relative p-5 space-y-4">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div
                                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${achievement.rarityColor} flex items-center justify-center shadow-lg ${isUnlocked ? 'group-hover:scale-110' : ''} transition-transform`}
                                    >
                                        {isUnlocked ? (
                                            <Icon className="w-7 h-7 text-white" />
                                        ) : (
                                            <Lock className="w-7 h-7 text-white/50" />
                                        )}
                                    </div>
                                    <Badge
                                        className={`bg-gradient-to-r ${achievement.rarityColor} text-white border-0 text-[10px] px-2 py-0.5`}
                                    >
                                        {achievement.rarity}
                                    </Badge>
                                </div>

                                {/* Content */}
                                <div className="space-y-2">
                                    <h3
                                        className={`font-bold text-lg ${isUnlocked ? 'text-white' : 'text-white/50'}`}
                                    >
                                        {achievement.title}
                                    </h3>
                                    <p
                                        className={`text-sm ${isUnlocked ? 'text-white/70' : 'text-white/40'}`}
                                    >
                                        {achievement.description}
                                    </p>
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span
                                            className={
                                                isUnlocked
                                                    ? 'text-white/60'
                                                    : 'text-white/40'
                                            }
                                        >
                                            Progress
                                        </span>
                                        <span
                                            className={`font-bold ${isUnlocked ? 'text-white' : 'text-white/50'}`}
                                        >
                                            {achievement.progress}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full bg-gradient-to-r ${achievement.rarityColor} rounded-full transition-all duration-500`}
                                            style={{
                                                width: `${achievement.progress}%`,
                                            }}
                                        >
                                            <div className="h-full w-full bg-gradient-to-r from-white/30 to-transparent" />
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                    <div className="flex items-center gap-2">
                                        <Star
                                            className={`w-4 h-4 ${isUnlocked ? 'text-[#cf6318]' : 'text-white/30'}`}
                                        />
                                        <span
                                            className={`text-sm font-bold ${isUnlocked ? 'text-[#cf6318]' : 'text-white/40'}`}
                                        >
                                            +{achievement.xp} XP
                                        </span>
                                    </div>
                                    {isUnlocked && achievement.unlockedDate && (
                                        <div className="flex items-center gap-1">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                                            <span className="text-xs text-white/50">
                                                {achievement.unlockedDate}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Back Button */}
            <div className="flex justify-center pt-4">
                <Link href="/profile">
                    <Button
                        variant="outline"
                        className="border-white/10 text-white hover:bg-white/10"
                    >
                        Back to Profile
                    </Button>
                </Link>
            </div>
        </div>
    );
}
