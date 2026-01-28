import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon, Lock } from 'lucide-react';

interface BadgeItem {
    id: string;
    name: string;
    icon: LucideIcon;
    unlocked: boolean;
    color: string;
}

interface AchievementBadgesProps {
    badges: BadgeItem[];
}

export function AchievementBadges({ badges }: AchievementBadgesProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <span className="text-yellow-400">🏆</span>
                    Achievement Badges
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {badges.map(badge => {
                        const Icon = badge.icon;

                        return (
                            <div
                                key={badge.id}
                                className={`relative p-4 rounded-lg border transition-all ${
                                    badge.unlocked
                                        ? `bg-gradient-to-br ${badge.color} border-white/20 shadow-lg`
                                        : 'bg-white/5 border-white/10 opacity-50'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                                            badge.unlocked
                                                ? 'bg-white/20'
                                                : 'bg-white/10'
                                        }`}
                                    >
                                        {badge.unlocked ? (
                                            <Icon className="h-5 w-5 text-white" />
                                        ) : (
                                            <Lock className="h-5 w-5 text-white/40" />
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <h4
                                            className={`font-medium ${badge.unlocked ? 'text-white' : 'text-white/60'}`}
                                        >
                                            {badge.name}
                                        </h4>
                                        {badge.unlocked && (
                                            <Badge
                                                variant="secondary"
                                                className="mt-1 bg-white/20 text-white border-white/30"
                                            >
                                                Unlocked
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
