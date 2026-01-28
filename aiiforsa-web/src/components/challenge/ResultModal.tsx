'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import type { ChallengeResult } from '@/types/challenge.types';
import { motion } from 'framer-motion';
import { Award, Clock, Flame, Target, TrendingUp, Trophy } from 'lucide-react';
import * as React from 'react';

export interface ResultModalProps {
    result: ChallengeResult | null;
    open: boolean;
    onClose: () => void;
    onPlayAgain: () => void;
    onViewLeaderboard: () => void;
}

export function ResultModal({
    result,
    open,
    onClose,
    onPlayAgain,
    onViewLeaderboard,
}: ResultModalProps) {
    const [scoreCount, setScoreCount] = React.useState(0);

    React.useEffect(() => {
        if (result && open) {
            let start = 0;
            const end = result.score;
            const duration = 1500;
            const increment = end / (duration / 16);

            const timer = setInterval(() => {
                start += increment;
                if (start >= end) {
                    setScoreCount(end);
                    clearInterval(timer);
                } else {
                    setScoreCount(Math.floor(start));
                }
            }, 16);

            return () => clearInterval(timer);
        }
    }, [result, open]);

    if (!result) return null;

    const accuracy = Math.round(
        (result.correctAnswers / result.totalQuestions) * 100,
    );
    const isPerfect = result.correctAnswers === result.totalQuestions;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl text-white">
                        <Trophy className="h-6 w-6 text-[#e67320]" />
                        Challenge Complete!
                    </DialogTitle>
                    <DialogDescription className="text-white/60">
                        {isPerfect
                            ? '🎉 Perfect score! You nailed it!'
                            : 'Great effort! Keep practicing to improve.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Score Display */}
                    <div className="text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200 }}
                            className="inline-block"
                        >
                            <div className="rounded-2xl p-8">
                                <p className="text-sm font-medium text-white/60">
                                    Final Score
                                </p>
                                <p className="text-6xl font-bold text-[#e67320]">
                                    {scoreCount}
                                </p>
                                <p className="mt-2 text-sm text-white/60">
                                    points
                                </p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-green-500/20 p-2">
                                    <Target className="h-5 w-5 text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-white/60">
                                        Accuracy
                                    </p>
                                    <p className="text-2xl font-bold text-white">
                                        {accuracy}%
                                    </p>
                                    <p className="text-xs text-white/40">
                                        {result.correctAnswers}/
                                        {result.totalQuestions} correct
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-500/20 p-2">
                                    <Clock className="h-5 w-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-white/60">
                                        Time Bonus
                                    </p>
                                    <p className="text-2xl font-bold text-white">
                                        +{result.timeBonus}
                                    </p>
                                    <p className="text-xs text-white/40">
                                        points
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-orange-500/20 p-2">
                                    <Flame className="h-5 w-5 text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-white/60">
                                        Streak Bonus
                                    </p>
                                    <p className="text-2xl font-bold text-white">
                                        +{result.streakBonus}
                                    </p>
                                    <p className="text-xs text-white/40">
                                        points
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-purple-500/20 p-2">
                                    <TrendingUp className="h-5 w-5 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-white/60">
                                        XP Gained
                                    </p>
                                    <p className="text-2xl font-bold text-white">
                                        +{result.xpGained}
                                    </p>
                                    <p className="text-xs text-white/40">
                                        experience
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* New Badges */}
                    {result.newBadges.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-[#e67320]" />
                                <h4 className="font-semibold text-white">
                                    New Badges Unlocked!
                                </h4>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {result.newBadges.map((badge, idx) => (
                                    <motion.div
                                        key={badge.id}
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{
                                            delay: idx * 0.1,
                                            type: 'spring',
                                        }}
                                    >
                                        <Badge className="bg-gradient-to-r from-[#e67320] to-[#cf6318] text-[#0a0a0a] px-4 py-2">
                                            {badge.name}
                                        </Badge>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Progress to next level */}
                    <div className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-white/60">
                                Level Progress
                            </span>
                            <span className="font-semibold text-white">
                                75 / 100 XP
                            </span>
                        </div>
                        <Progress value={75} className="h-2" />
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        onClick={onViewLeaderboard}
                        variant="outline"
                        className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                    >
                        View Leaderboard
                    </Button>
                    <Button
                        onClick={onPlayAgain}
                        className="bg-[#e67320] text-[#0a0a0a] hover:bg-[#cf6318]"
                    >
                        Play Again
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default ResultModal;
