'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import confetti from 'canvas-confetti';
import { Sparkles, Star, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';

interface LevelUpModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    level: number;
    badge?: {
        name: string;
        icon?: string;
        color?: string;
    } | null;
}

export function LevelUpModal({
    open,
    onOpenChange,
    level,
    badge,
}: LevelUpModalProps) {
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (open && !showConfetti) {
            setShowConfetti(true);
            // Trigger confetti animation
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;

            const randomInRange = (min: number, max: number) => {
                return Math.random() * (max - min) + min;
            };

            const interval = setInterval(() => {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    clearInterval(interval);
                    return;
                }

                const particleCount = 50 * (timeLeft / duration);

                confetti({
                    particleCount,
                    startVelocity: 30,
                    spread: 360,
                    origin: {
                        x: randomInRange(0.1, 0.3),
                        y: Math.random() - 0.2,
                    },
                    colors: ['#cf6318', '#e67320', '#FFD700', '#FFA500'],
                });
                confetti({
                    particleCount,
                    startVelocity: 30,
                    spread: 360,
                    origin: {
                        x: randomInRange(0.7, 0.9),
                        y: Math.random() - 0.2,
                    },
                    colors: ['#cf6318', '#e67320', '#FFD700', '#FFA500'],
                });
            }, 250);

            return () => clearInterval(interval);
        }
    }, [open, showConfetti]);

    const handleClose = () => {
        setShowConfetti(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] border-[#e67320]/50">
                <div className="absolute inset-0 overflow-hidden rounded-lg">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-[#e67320]/20 to-transparent rounded-full blur-3xl" />
                </div>

                <DialogHeader className="relative">
                    <DialogTitle className="sr-only">Level Up!</DialogTitle>
                </DialogHeader>

                <div className="relative text-center py-6 space-y-6">
                    {/* Animated stars */}
                    <div className="absolute inset-0 pointer-events-none">
                        {[...Array(6)].map((_, i) => (
                            <Sparkles
                                key={i}
                                className="absolute text-[#e67320] animate-pulse"
                                style={{
                                    top: `${20 + Math.random() * 60}%`,
                                    left: `${10 + Math.random() * 80}%`,
                                    animationDelay: `${i * 0.2}s`,
                                    width: `${12 + Math.random() * 12}px`,
                                    height: `${12 + Math.random() * 12}px`,
                                }}
                            />
                        ))}
                    </div>

                    {/* Level badge */}
                    <div className="relative">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#cf6318] to-[#e67320] shadow-lg shadow-[#e67320]/30">
                            <span className="text-4xl font-bold text-white">
                                {level}
                            </span>
                        </div>
                        <Trophy className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-bounce" />
                    </div>

                    {/* Congratulations text */}
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white">
                            Level Up! 🎉
                        </h2>
                        <p className="text-white/70">
                            Congratulations! You&apos;ve reached{' '}
                            <span className="text-[#e67320] font-semibold">
                                Level {level}
                            </span>
                        </p>
                    </div>

                    {/* Badge earned */}
                    {badge && (
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center justify-center gap-3">
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                                    style={{
                                        backgroundColor: badge.color
                                            ? `${badge.color}20`
                                            : undefined,
                                    }}
                                >
                                    {badge.icon || (
                                        <Star className="w-6 h-6 text-yellow-400" />
                                    )}
                                </div>
                                <div className="text-left">
                                    <p className="text-xs text-white/50 uppercase tracking-wider">
                                        New Badge Unlocked
                                    </p>
                                    <p className="font-semibold text-white">
                                        {badge.name}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Continue button */}
                    <Button
                        onClick={handleClose}
                        className="w-full bg-gradient-to-r from-[#cf6318] to-[#e67320] hover:opacity-90 text-white font-semibold"
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Continue
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
