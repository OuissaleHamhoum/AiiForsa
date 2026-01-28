/**
 * Challenge System Types
 * Types for the gamified job hunt challenge feature
 */

export type ChallengeType = 'mcq' | 'text' | 'match';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Challenge {
    id: string;
    title: string;
    description: string;
    type: ChallengeType;
    difficulty: Difficulty;
    timeLimit: number; // seconds
    questions: Question[];
    icon: string; // lucide icon name
    estimatedTime: string; // "5 min"
    pointsReward: number;
}

export interface Question {
    id: string;
    type: 'mcq' | 'text' | 'match';
    question: string;
    options?: string[]; // for MCQ
    correctAnswers?: string[]; // for MCQ (array of correct option texts)
    multiSelect?: boolean; // for MCQ - allow multiple selections
    pairs?: { left: string; right: string }[]; // for Match
    keywords?: string[]; // for Text evaluation (simple demo)
    points: number;
}

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    username: string;
    avatarUrl?: string;
    points: number;
    completedChallenges: number;
}

export interface UserProgress {
    points: number;
    level: number;
    streak: number; // consecutive days
    badges: Badge[];
    completedChallenges: string[];
    lastPlayedDate?: string;
}

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string; // lucide icon name or emoji
    rarity?: 'common' | 'rare' | 'epic' | 'legendary';
    unlockedAt?: string;
}

export interface ChallengeResult {
    challengeId?: string;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    timeBonus: number;
    streakBonus: number;
    newBadges: Badge[];
    xpGained: number;
    completedAt?: Date;
}

export interface Answer {
    questionId: string;
    selectedOptions: string[]; // for MCQ - array of selected option texts
    textAnswer: string; // for text questions
    matchedPairs: Record<string, string>; // for match questions
    isCorrect?: boolean;
}

export default Challenge;
