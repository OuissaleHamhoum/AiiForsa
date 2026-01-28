'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Challenge } from '@/types/challenge.types';
import { motion } from 'framer-motion';
import {
    Brain,
    Clock,
    Link2,
    LucideIcon,
    Megaphone,
    Play,
    Trophy,
} from 'lucide-react';

export interface ChallengeCardProps {
    challenge: Challenge;
    onStart: (challengeId: string) => void;
}

const iconMap: Record<string, LucideIcon> = {
    brain: Brain,
    megaphone: Megaphone,
    link2: Link2,
    trophy: Trophy,
};

const difficultyConfig = {
    easy: {
        color: 'bg-green-500/20 text-green-400 border-green-500/30',
        label: 'Easy',
    },
    medium: {
        color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        label: 'Medium',
    },
    hard: {
        color: 'bg-red-500/20 text-red-400 border-red-500/30',
        label: 'Hard',
    },
};

export function ChallengeCard({ challenge, onStart }: ChallengeCardProps) {
    const IconComponent = iconMap[challenge.icon] || Brain;
    const difficultyStyle = difficultyConfig[challenge.difficulty];

    return (
        <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            <Card className="group relative overflow-hidden p-6 transition-all hover:border-[#e67320]/30 hover:shadow-[#e67320]/10">
                {/* Icon */}
                <div className="mb-4 flex items-center justify-between">
                    <div className="rounded-xl bg-[#e67320]/20 p-3">
                        <IconComponent className="h-6 w-6 text-[#e67320]" />
                    </div>
                    <Badge className={difficultyStyle.color}>
                        {difficultyStyle.label}
                    </Badge>
                </div>

                {/* Title & Description */}
                <h3 className="mb-2 text-xl font-bold text-white">
                    {challenge.title}
                </h3>
                <p className="mb-4 text-sm text-white/60">
                    {challenge.description}
                </p>

                {/* Meta Info */}
                <div className="mb-4 flex items-center gap-4 text-sm text-white/60">
                    <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{challenge.estimatedTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        <span>{challenge.pointsReward} pts</span>
                    </div>
                </div>

                {/* Start Button */}
                <Button
                    onClick={() => onStart(challenge.id)}
                    className="w-full bg-[#e67320] text-[#0a0a0a] hover:bg-[#cf6318] transition-all"
                    aria-label={`Start ${challenge.title} challenge`}
                >
                    <Play className="mr-2 h-4 w-4" />
                    Start Challenge
                </Button>
            </Card>
        </motion.div>
    );
}

export default ChallengeCard;
