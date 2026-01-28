'use server';

import { auth } from '@/auth';
import type {
    Achievement,
    AchievementKey,
    TriggerEventResult,
    XpStatus,
} from '@/lib/xp-constants';
import { ACHIEVEMENT_KEYS } from '@/lib/xp-constants';

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Helper for authenticated requests
async function authenticatedFetch<T>(
    endpoint: string,
    options: RequestInit = {},
): Promise<{ success: boolean; data?: T; error?: string }> {
    const session = await auth();
    const token = session?.user?.accessToken;

    if (!token) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                ...options.headers,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                success: false,
                error:
                    errorData.message ||
                    `Request failed with status ${response.status}`,
            };
        }

        const responseData = await response.json();
        // API returns { statusCode, message, data }, unwrap the data field
        const data = responseData?.data ?? responseData;
        return { success: true, data };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Request failed',
        };
    }
}

// ============================================================================
// XP ACTIONS
// ============================================================================

/**
 * Get current user's XP status
 */
export async function getXpStatus(): Promise<{
    success: boolean;
    data?: XpStatus;
    error?: string;
}> {
    return authenticatedFetch<XpStatus>('/users/me/xp');
}

/**
 * Trigger an XP event
 */
export async function triggerXpEvent(
    key: AchievementKey | string,
    meta?: Record<string, unknown>,
): Promise<{ success: boolean; data?: TriggerEventResult; error?: string }> {
    return authenticatedFetch<TriggerEventResult>('/users/me/xp/events', {
        method: 'POST',
        body: JSON.stringify({ key, meta }),
    });
}

/**
 * Complete a daily challenge
 */
export async function completeDailyChallenge(
    challengeKey: string,
): Promise<{ success: boolean; data?: TriggerEventResult; error?: string }> {
    return authenticatedFetch<TriggerEventResult>(
        '/users/me/xp/daily-challenge',
        {
            method: 'POST',
            body: JSON.stringify({ challengeKey }),
        },
    );
}

/**
 * Check and award milestone achievements
 */
export async function checkMilestones(): Promise<{
    success: boolean;
    data?: TriggerEventResult;
    error?: string;
}> {
    return authenticatedFetch<TriggerEventResult>(
        '/users/me/xp/check-milestones',
        {
            method: 'POST',
        },
    );
}

/**
 * Redeem/claim an achievement
 */
export async function redeemAchievement(
    achievementId: string,
): Promise<{ success: boolean; data?: Achievement; error?: string }> {
    return authenticatedFetch<Achievement>(
        `/users/me/xp/achievements/${achievementId}/redeem`,
        {
            method: 'POST',
        },
    );
}

/**
 * Get all achievement definitions
 */
export async function getAchievementDefinitions(): Promise<{
    success: boolean;
    data?: Array<{
        id: string;
        key: string;
        title: string;
        description?: string;
        xpReward: number;
        icon?: string;
        category: string;
        repeatable: boolean;
    }>;
    error?: string;
}> {
    return authenticatedFetch('/users/me/xp/achievements');
}

// Achievement Definition with Progress interface
export interface AchievementDefinitionWithProgress {
    id: string;
    key: string;
    title: string;
    description?: string;
    xpReward: number;
    icon?: string;
    category: string;
    conditionType?: string;
    conditionValue?: number;
    repeatable: boolean;
    maxRepeats?: number;
    // User-specific
    earned: boolean;
    earnCount: number;
    claimed: boolean;
    claimedAt?: string | null;
    awardedAt?: string | null;
    userAchievementId?: string | null;
    // Progress tracking
    progress: {
        current: number;
        target: number;
        percent: number;
    };
}

/**
 * Get all achievement definitions with user progress
 */
export async function getAchievementDefinitionsWithProgress(): Promise<{
    success: boolean;
    data?: AchievementDefinitionWithProgress[];
    error?: string;
}> {
    return authenticatedFetch<AchievementDefinitionWithProgress[]>(
        '/users/me/xp/achievements',
    );
}

/**
 * Get all badge definitions
 */
export async function getBadgeDefinitions(): Promise<{
    success: boolean;
    data?: Array<{
        id: string;
        level: number;
        name: string;
        description?: string;
        icon?: string;
        color?: string;
    }>;
    error?: string;
}> {
    return authenticatedFetch('/users/me/xp/badges');
}

/**
 * Get XP leaderboard
 */
export async function getLeaderboard(limit = 10): Promise<{
    success: boolean;
    data?: Array<{
        rank: number;
        id: string;
        name: string;
        profileImage?: string;
        xp: number;
        level: number;
        currentBadge?: {
            name: string;
            icon?: string;
            color?: string;
        };
    }>;
    error?: string;
}> {
    return authenticatedFetch(`/users/me/xp/leaderboard?limit=${limit}`);
}

// ============================================================================
// CONVENIENCE FUNCTIONS FOR COMMON XP EVENTS
// ============================================================================

/**
 * Award XP for publishing a post
 */
export async function awardPostXp() {
    return triggerXpEvent(ACHIEVEMENT_KEYS.THOUGHT_LEADER);
}

/**
 * Award XP for leaving a comment
 */
export async function awardCommentXp() {
    return triggerXpEvent(ACHIEVEMENT_KEYS.COMMUNITY_VOICE);
}

/**
 * Award XP for completing an interview
 */
export async function awardInterviewXp(applicationId?: string) {
    return triggerXpEvent(ACHIEVEMENT_KEYS.INTERVIEW_INSIGHT, {
        applicationId,
    });
}

/**
 * Award XP for advice consultation
 */
export async function awardAdviceConsultationXp() {
    return triggerXpEvent(ACHIEVEMENT_KEYS.ADVISOR);
}

/**
 * Award XP for completing an advice step
 */
export async function awardAdviceStepXp(stepId?: string) {
    return triggerXpEvent(ACHIEVEMENT_KEYS.ADVICE_STEP_COMPLETE, { stepId });
}

/**
 * Trigger profile complete achievement
 */
export async function triggerProfileComplete() {
    return triggerXpEvent(ACHIEVEMENT_KEYS.PROFILE_PIONEER);
}

/**
 * Trigger CV upload achievement check
 */
export async function triggerCvUpload() {
    return checkMilestones();
}

/**
 * Trigger project created achievement
 */
export async function triggerProjectCreated() {
    return triggerXpEvent(ACHIEVEMENT_KEYS.LAUNCHPAD);
}

/**
 * Trigger skill added achievement check
 */
export async function triggerSkillAdded() {
    return checkMilestones();
}

/**
 * Trigger work experience added achievement
 */
export async function triggerWorkExperienceAdded() {
    return checkMilestones();
}

/**
 * Trigger application submitted achievement check
 */
export async function triggerApplicationSubmitted() {
    return checkMilestones();
}
