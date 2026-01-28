'use client';

import { Card } from '@/components/ui/card';
import { Activity, Briefcase, Target, TrendingUp } from 'lucide-react';

export function ActivityStats() {
    const stats = [
        {
            label: 'Applications',
            value: '24',
            change: '+12%',
            icon: Briefcase,
            color: 'from-blue-500 to-cyan-500',
        },
        {
            label: 'Interviews',
            value: '8',
            change: '+3',
            icon: Target,
            color: 'from-green-500 to-emerald-500',
        },
        {
            label: 'Profile Views',
            value: '342',
            change: '+28%',
            icon: Activity,
            color: 'from-purple-500 to-pink-500',
        },
        {
            label: 'Success Rate',
            value: '78%',
            change: '+5%',
            icon: TrendingUp,
            color: 'from-orange-500 to-red-500',
        },
    ];

    const weeklyActivity = [
        { day: 'Mon', value: 4 },
        { day: 'Tue', value: 7 },
        { day: 'Wed', value: 5 },
        { day: 'Thu', value: 9 },
        { day: 'Fri', value: 6 },
        { day: 'Sat', value: 3 },
        { day: 'Sun', value: 8 },
    ];

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const maxValue = Math.max(...weeklyActivity.map(d => d.value));

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <Card
                        key={index}
                        className="group cursor-pointer hover:scale-[1.02]"
                    >
                        {/* Animated gradient background */}
                        <div
                            className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-[0.15] transition-opacity duration-500`}
                        />

                        {/* Glowing effect on hover */}
                        <div className="absolute -inset-[1px] bg-gradient-to-br from-[#cf6318]/0 via-[#cf6318]/0 to-[#cf6318]/0 group-hover:from-[#cf6318]/20 group-hover:via-[#e67320]/10 group-hover:to-transparent rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative p-4 flex items-center gap-3">
                            {/* Icon with gradient and glow */}
                            <div
                                className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg shadow-black/20 group-hover:shadow-xl group-hover:shadow-black/40 transition-all duration-300 flex-shrink-0`}
                            >
                                <div
                                    className={`absolute inset-0 rounded-xl bg-gradient-to-br ${stat.color} blur-md opacity-50 group-hover:opacity-75 transition-opacity`}
                                />
                                <Icon className="w-5 h-5 text-white relative z-10" />
                            </div>

                            {/* Stats content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 mb-0.5">
                                    <p className="text-2xl font-black text-white leading-none tracking-tight">
                                        {stat.value}
                                    </p>
                                    <span className="text-[10px] font-bold text-green-400 leading-none">
                                        {stat.change}
                                    </span>
                                </div>
                                <p className="text-[11px] text-white/50 font-medium truncate">
                                    {stat.label}
                                </p>
                            </div>
                        </div>

                        {/* Subtle top accent */}
                        <div
                            className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${stat.color} opacity-30 group-hover:opacity-60 transition-opacity`}
                        />
                    </Card>
                );
            })}
        </div>
    );
}
