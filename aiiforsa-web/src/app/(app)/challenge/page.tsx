'use client';

import { ChallengeCard } from '@/components/challenge/ChallengeCard';
import { Leaderboard } from '@/components/challenge/Leaderboard';
import { Card } from '@/components/ui/card';
import type { Challenge, LeaderboardEntry } from '@/types/challenge.types';
import { Brain, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';

// TODO: Replace with real data from backend API
const MOCK_CHALLENGES: Challenge[] = [
    {
        id: '1',
        title: 'Quick Thinker Quiz',
        description:
            'Test your knowledge of job interview basics and workplace etiquette.',
        type: 'mcq',
        difficulty: 'easy',
        timeLimit: 300,
        questions: [
            {
                id: 'q1',
                type: 'mcq',
                question:
                    'What is the best way to prepare for a job interview?',
                options: [
                    'Research the company',
                    'Practice common questions',
                    'Prepare questions to ask',
                    'All of the above',
                ],
                correctAnswers: ['All of the above'],
                multiSelect: false,
                points: 10,
            },
            {
                id: 'q2',
                type: 'mcq',
                question:
                    'Which skills are most valued in the workplace? (Select all)',
                options: [
                    'Communication',
                    'Teamwork',
                    'Time Management',
                    'Technical Skills',
                ],
                correctAnswers: [
                    'Communication',
                    'Teamwork',
                    'Time Management',
                    'Technical Skills',
                ],
                multiSelect: true,
                points: 15,
            },
        ],
        icon: 'Brain',
        estimatedTime: '5 min',
        pointsReward: 50,
    },
    {
        id: '2',
        title: 'Pitch Battle',
        description:
            'Craft a compelling elevator pitch that showcases your unique value.',
        type: 'text',
        difficulty: 'medium',
        timeLimit: 600,
        questions: [
            {
                id: 'q1',
                type: 'text',
                question:
                    'Write a 30-second elevator pitch about yourself that highlights your key strengths and career goals.',
                keywords: ['experience', 'skills', 'passion', 'goals'],
                points: 20,
            },
            {
                id: 'q2',
                type: 'text',
                question:
                    'Describe a challenging project you worked on and how you overcame obstacles.',
                keywords: ['challenge', 'solution', 'teamwork', 'result'],
                points: 25,
            },
        ],
        icon: 'Megaphone',
        estimatedTime: '10 min',
        pointsReward: 100,
    },
    {
        id: '3',
        title: 'Skill Matcher',
        description:
            'Match job roles with their essential skills and responsibilities.',
        type: 'match',
        difficulty: 'hard',
        timeLimit: 420,
        questions: [
            {
                id: 'q1',
                type: 'match',
                question: 'Match each role with its primary responsibility:',
                pairs: [
                    { left: 'Product Manager', right: 'Define product vision' },
                    { left: 'Software Engineer', right: 'Write and test code' },
                    { left: 'UX Designer', right: 'Design user interfaces' },
                    { left: 'Data Analyst', right: 'Analyze business metrics' },
                ],
                points: 30,
            },
        ],
        icon: 'Link2',
        estimatedTime: '7 min',
        pointsReward: 150,
    },
];

const MOCK_LEADERBOARD: LeaderboardEntry[] = [
    {
        rank: 1,
        userId: 'user1',
        username: 'AlexMaster',
        avatarUrl: undefined,
        points: 2850,
        completedChallenges: 15,
    },
    {
        rank: 2,
        userId: 'user2',
        username: 'SarahPro',
        points: 2640,
        completedChallenges: 14,
    },
    {
        rank: 3,
        userId: 'user3',
        username: 'JohnDev',
        points: 2320,
        completedChallenges: 12,
    },
    {
        rank: 4,
        userId: 'user4',
        username: 'EmilyCode',
        points: 2100,
        completedChallenges: 11,
    },
    {
        rank: 5,
        userId: 'user5',
        username: 'MikeDesign',
        points: 1950,
        completedChallenges: 10,
    },
];

export default function ChallengePage() {
    const router = useRouter();

    // TODO: Fetch user progress from backend
    const userProgress = {
        points: 1250,
        level: 5,
        streak: 3,
        nextLevelXP: 1500,
    };

    return (
        <div className="min-h-screen py-8">
            <div className="container mx-auto px-4">
                {/* Hero Section - User Stats */}
                <div className="mb-8 rounded-2xl p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h1 className="mb-2 text-4xl font-bold text-white">
                                Job Hunt Challenge Sprint
                            </h1>
                            <p className="text-white/60">
                                Level up your skills with gamified challenges
                            </p>
                        </div>
                        <div className="flex gap-6">
                            <div className="text-center">
                                <div className="flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-[#e67320]" />
                                    <p className="text-2xl font-bold text-white">
                                        {userProgress.points}
                                    </p>
                                </div>
                                <p className="text-sm text-white/60">
                                    Total Points
                                </p>
                            </div>
                            <div className="border-l border-white/10" />
                            <div className="text-center">
                                <p className="text-2xl font-bold text-white">
                                    Level {userProgress.level}
                                </p>
                                <p className="text-sm text-white/60">
                                    {userProgress.nextLevelXP -
                                        userProgress.points}{' '}
                                    XP to next
                                </p>
                            </div>
                            <div className="border-l border-white/10" />
                            <div className="text-center">
                                <div className="flex items-center gap-1">
                                    <p className="text-2xl font-bold text-orange-500">
                                        🔥 {userProgress.streak}
                                    </p>
                                </div>
                                <p className="text-sm text-white/60">
                                    Day Streak
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                    {/* Main Content - Challenges */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="mb-4 text-2xl font-bold text-white">
                                Available Challenges
                            </h2>
                            <div className="grid gap-4 sm:grid-cols-2">
                                {MOCK_CHALLENGES.map(challenge => (
                                    <ChallengeCard
                                        key={challenge.id}
                                        challenge={challenge}
                                        onStart={id => {
                                            router.push(`/challenge/${id}`);
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Info Card */}
                        <Card className="rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="rounded-lg bg-[#e67320]/20 p-3">
                                    <Brain className="h-6 w-6 text-[#e67320]" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="mb-2 text-lg font-bold text-white">
                                        How Challenges Work
                                    </h3>
                                    <ul className="space-y-2 text-sm text-white/60">
                                        <li>
                                            • Complete challenges to earn points
                                            and badges
                                        </li>
                                        <li>
                                            • Time bonuses reward fast, accurate
                                            completions
                                        </li>
                                        <li>
                                            • Maintain your daily streak for
                                            bonus XP
                                        </li>
                                        <li>
                                            • Compete on the leaderboard with
                                            other job seekers
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar - Leaderboard */}
                    <div>
                        <Leaderboard
                            entries={MOCK_LEADERBOARD}
                            currentUserId="user-current"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
