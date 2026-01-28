'use client';

import { cn } from '@/lib/utils';

interface XPBarProps {
    xp: number;
    level: number;
    nextLevelXp: number;
    progressPercent: number;
    className?: string;
    showLevel?: boolean;
    showXpText?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function XPBar({
    xp,
    level,
    nextLevelXp,
    progressPercent,
    className,
    showLevel = true,
    showXpText = true,
    size = 'md',
}: XPBarProps) {
    const sizeClasses = {
        sm: 'h-1.5',
        md: 'h-2',
        lg: 'h-3',
    };

    const textSizeClasses = {
        sm: 'text-[10px]',
        md: 'text-xs',
        lg: 'text-sm',
    };

    return (
        <div className={cn('w-full', className)}>
            {/* Header with level and XP */}
            {(showLevel || showXpText) && (
                <div
                    className={cn(
                        'flex items-center justify-between mb-1',
                        textSizeClasses[size],
                    )}
                >
                    {showLevel && (
                        <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-white">
                                Level {level}
                            </span>
                            <span className="text-white/50">•</span>
                            <span className="text-white/70">{xp} XP</span>
                        </div>
                    )}
                    {showXpText && (
                        <div className="text-white/60">
                            {xp}/{nextLevelXp} XP
                        </div>
                    )}
                </div>
            )}

            {/* Progress bar */}
            <div
                className={cn(
                    'w-full bg-white/10 rounded-full overflow-hidden',
                    sizeClasses[size],
                )}
            >
                <div
                    className="h-full bg-gradient-to-r from-[#cf6318] to-[#e67320] transition-all duration-500 ease-out rounded-full"
                    style={{
                        width: `${Math.min(100, Math.max(0, progressPercent))}%`,
                    }}
                />
            </div>
        </div>
    );
}
