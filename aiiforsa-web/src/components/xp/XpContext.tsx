'use client';

import {
    checkMilestones,
    getXpStatus,
    triggerXpEvent,
} from '@/actions/xp-actions';
import { LevelUpModal } from '@/components/xp/LevelUpModal';
import type {
    AchievementKey,
    TriggerEventResult,
    XpStatus,
} from '@/lib/xp-constants';
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import { toast } from 'sonner';

interface XpContextType {
    xpStatus: XpStatus | null;
    loading: boolean;
    refreshXpStatus: () => Promise<void>;
    triggerEvent: (
        key: AchievementKey | string,
        meta?: Record<string, any>,
    ) => Promise<TriggerEventResult | null>;
    checkAndAwardMilestones: () => Promise<void>;
}

const XpContext = createContext<XpContextType | undefined>(undefined);

export function XpProvider({ children }: { children: React.ReactNode }) {
    const [xpStatus, setXpStatus] = useState<XpStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [levelUpModal, setLevelUpModal] = useState<{
        open: boolean;
        level: number;
        badge?: { name: string; icon?: string; color?: string } | null;
    }>({ open: false, level: 0, badge: null });

    const refreshXpStatus = useCallback(async () => {
        try {
            const result = await getXpStatus();
            if (result.success && result.data) {
                setXpStatus(result.data);
            }
        } catch {
            // Failed to fetch XP status
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshXpStatus();
    }, [refreshXpStatus]);

    const showAchievementNotifications = useCallback(
        (result: TriggerEventResult) => {
            // Show toast for each achievement earned
            result.awardedAchievements.forEach(achievement => {
                toast.success(
                    <div className="flex items-center gap-2">
                        <span className="text-xl">
                            {achievement.icon || '🏆'}
                        </span>
                        <div>
                            <p className="font-semibold">{achievement.title}</p>
                            <p className="text-xs text-white/70">
                                +{achievement.xpReward} XP
                            </p>
                        </div>
                    </div>,
                    { duration: 4000 },
                );
            });

            // Show level up modal
            if (result.leveledUp && result.newLevel) {
                const newBadge = result.newBadges[0];
                setLevelUpModal({
                    open: true,
                    level: result.newLevel,
                    badge: newBadge
                        ? { name: newBadge.name, icon: newBadge.icon }
                        : null,
                });
            }
        },
        [],
    );

    const triggerEvent = useCallback(
        async (
            key: AchievementKey | string,
            meta?: Record<string, any>,
        ): Promise<TriggerEventResult | null> => {
            try {
                const result = await triggerXpEvent(key, meta);
                if (result.success && result.data) {
                    showAchievementNotifications(result.data);
                    refreshXpStatus();
                    return result.data;
                }
            } catch {
                // Failed to trigger XP event
            }
            return null;
        },
        [showAchievementNotifications, refreshXpStatus],
    );

    const checkAndAwardMilestones = useCallback(async () => {
        try {
            const result = await checkMilestones();
            if (result.success && result.data) {
                showAchievementNotifications(result.data);
                refreshXpStatus();
            }
        } catch {
            // Failed to check milestones
        }
    }, [showAchievementNotifications, refreshXpStatus]);

    return (
        <XpContext.Provider
            value={{
                xpStatus,
                loading,
                refreshXpStatus,
                triggerEvent,
                checkAndAwardMilestones,
            }}
        >
            {children}
            <LevelUpModal
                open={levelUpModal.open}
                onOpenChange={open =>
                    setLevelUpModal(prev => ({ ...prev, open }))
                }
                level={levelUpModal.level}
                badge={levelUpModal.badge}
            />
        </XpContext.Provider>
    );
}

export function useXp() {
    const context = useContext(XpContext);
    if (context === undefined) {
        throw new Error('useXp must be used within an XpProvider');
    }
    return context;
}
