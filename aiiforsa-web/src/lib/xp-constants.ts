// XP System Constants and Types
// These are shared between client and server

// Achievement event keys (must match backend)
export const ACHIEVEMENT_KEYS = {
    // Daily Challenges (30 XP each, max 90 daily)
    DAILY_SPARK_A: 'DAILY_SPARK_A',
    DAILY_SPARK_B: 'DAILY_SPARK_B',
    DAILY_SPARK_C: 'DAILY_SPARK_C',

    // Career achievements
    APPLICATION_ACE: 'APPLICATION_ACE', // 50 XP for 5 applications
    INTERVIEW_TRAILBLAZER: 'INTERVIEW_TRAILBLAZER', // 50 XP for 5 interviews
    INTERVIEW_INSIGHT: 'INTERVIEW_INSIGHT', // 20 XP per interview for application

    // Community achievements
    THOUGHT_LEADER: 'THOUGHT_LEADER', // 20 XP per post
    COMMUNITY_VOICE: 'COMMUNITY_VOICE', // 5 XP per comment
    CONNECTOR: 'CONNECTOR', // 10 XP for 5 interactions

    // CV/Resume achievements
    RESUME_ARCHIVIST: 'RESUME_ARCHIVIST', // 50 XP per 3 CVs

    // Advice achievements
    ADVISOR: 'ADVISOR', // 50 XP per consultation
    ADVICE_STEP_COMPLETE: 'ADVICE_STEP_COMPLETE', // 10 XP per step

    // Profile achievements
    PROFILE_PIONEER: 'PROFILE_PIONEER', // Profile complete
    LAUNCHPAD: 'LAUNCHPAD', // First project
    PROJECT_BUILDER: 'PROJECT_BUILDER', // 5 projects
    SKILL_COLLECTOR: 'SKILL_COLLECTOR', // 5 skills
    SKILL_MASTER: 'SKILL_MASTER', // 10 skills
    WORK_STARTER: 'WORK_STARTER', // First work experience
    CAREER_CLIMBER: 'CAREER_CLIMBER', // 3 work experiences
} as const;

export type AchievementKey =
    (typeof ACHIEVEMENT_KEYS)[keyof typeof ACHIEVEMENT_KEYS];

// Types
export interface Achievement {
    id: string;
    key: string;
    title: string;
    description?: string;
    xpReward: number;
    icon?: string;
    category: string;
    claimed: boolean;
    claimedAt?: string | null;
    earnCount: number;
    awardedAt: string;
    meta?: Record<string, unknown> | null;
    createdAt?: string;
    updatedAt?: string;
}

export interface Badge {
    id: string;
    name: string;
    description?: string;
    level: number;
    icon?: string;
    color?: string;
    awardedAt: string;
}

export interface DailyChallenge {
    id: string;
    key: string;
    title: string;
    description?: string;
    xpReward: number;
    icon?: string;
    completed: boolean;
}

export interface XpStatus {
    xp: number;
    level: number;
    currentLevelXp: number;
    nextLevelXp: number;
    progressXp: number;
    progressPercent: number;
    xpPerLevel: number;
    displayRange: string;
    achievements: Achievement[];
    badges: Badge[];
    currentBadge: {
        name: string;
        icon?: string;
        color?: string;
    } | null;
    dailyChallenges: {
        available: DailyChallenge[];
        completedToday: number;
        maxDaily: number;
    };
}

export interface TriggerEventResult {
    xp: number;
    level: number;
    xpGained: number;
    leveledUp: boolean;
    newLevel?: number;
    awardedAchievements: Array<{
        id: string;
        key: string;
        title: string;
        xpReward: number;
        icon?: string;
    }>;
    newBadges: Array<{
        id: string;
        name: string;
        level: number;
        icon?: string;
    }>;
}

// XP per level constant
export const XP_PER_LEVEL = 300;
