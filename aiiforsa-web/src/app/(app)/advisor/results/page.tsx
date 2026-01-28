'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft,
    BookOpen,
    Brain,
    CheckCircle2,
    Clock,
    ExternalLink,
    FileText,
    GraduationCap,
    Lightbulb,
    MessageSquare,
    Send,
    Star,
    Target,
    TrendingUp,
    Youtube,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';

interface Resource {
    type: string;
    title: string;
    url: string;
    explanation: string;
}

interface StepFeedback {
    clarityScore: number | null;
    relevanceScore: number | null;
    difficultyLevel: string | null;
    userComment: string | null;
}

interface LearningStep {
    stepNumber: number;
    title: string;
    description: string;
    duration: string;
    skillsTargeted: string[];
    recommendedResources: Resource[];
    feedback: StepFeedback;
    explainabilityNote?: string;
}

interface RoadmapData {
    userProfile?: {
        currentRole?: string;
        targetRole?: string;
        skills?: string[];
        weaknesses?: string[];
    };
    learningPath?: {
        pathTitle: string;
        duration: string;
        personalizationScore?: number;
        steps: LearningStep[];
    };
    explainabilityMeta?: {
        technique: string;
        method: string;
        feedbackLoopEnabled: boolean;
    };
    aiReasoningTrace?: Array<{
        step: number;
        identifiedGap: string;
        modelExplanation: string;
        dataBasis: string;
    }>;
}

const getResourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
        case 'youtube':
            return <Youtube className="w-5 h-5" />;
        case 'coursera':
        case 'udemy':
            return <GraduationCap className="w-5 h-5" />;
        case 'book':
            return <BookOpen className="w-5 h-5" />;
        default:
            return <FileText className="w-5 h-5" />;
    }
};

function getMockData(): RoadmapData {
    return {
        learningPath: {
            pathTitle: 'Your Career Roadmap',
            duration: '12 months',
            personalizationScore: 90,
            steps: [
                {
                    stepNumber: 1,
                    title: 'Step 1',
                    description: 'Description',
                    duration: '3 months',
                    skillsTargeted: ['Skill 1'],
                    recommendedResources: [],
                    feedback: {
                        clarityScore: null,
                        relevanceScore: null,
                        difficultyLevel: null,
                        userComment: null,
                    },
                },
            ],
        },
    };
}

import { Suspense } from 'react';

function CareerAdvisorResultsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [roadmapData, setRoadmapData] = React.useState<RoadmapData | null>(
        null,
    );
    const [expandedSteps, setExpandedSteps] = React.useState<Set<number>>(
        new Set([1]),
    );
    const [stepProgress, setStepProgress] = React.useState<
        Map<number, boolean>
    >(new Map());
    const [feedbackForms, setFeedbackForms] = React.useState<
        Map<number, StepFeedback>
    >(new Map());
    const [feedbackLoading, setFeedbackLoading] = React.useState<
        Map<number, boolean>
    >(new Map());
    const [feedbackError, setFeedbackError] = React.useState<
        Map<number, string>
    >(new Map());

    React.useEffect(() => {
        const dataParam = searchParams.get('data');
        if (dataParam) {
            try {
                const parsed = JSON.parse(decodeURIComponent(dataParam));
                setRoadmapData(parsed);
                if (parsed.learningPath?.steps) {
                    const initialFeedback = new Map();
                    parsed.learningPath.steps.forEach((step: LearningStep) => {
                        initialFeedback.set(step.stepNumber, {
                            clarityScore: null,
                            relevanceScore: null,
                            difficultyLevel: null,
                            userComment: '',
                        });
                    });
                    setFeedbackForms(initialFeedback);
                }
            } catch {
                setRoadmapData(getMockData());
            }
        } else {
            setRoadmapData(getMockData());
        }
    }, [searchParams]);

    const toggleStep = (stepNumber: number) => {
        setExpandedSteps(prev => {
            const newSet = new Set(prev);
            if (newSet.has(stepNumber)) {
                newSet.delete(stepNumber);
            } else {
                newSet.add(stepNumber);
            }
            return newSet;
        });
    };

    const toggleStepCompletion = (stepNumber: number) => {
        setStepProgress(prev => {
            const newMap = new Map(prev);
            newMap.set(stepNumber, !prev.get(stepNumber));
            return newMap;
        });
    };

    const updateFeedback = (
        stepNumber: number,
        field: keyof StepFeedback,
        value: any,
    ) => {
        setFeedbackForms(prev => {
            const newMap = new Map(prev);
            const current = newMap.get(stepNumber) || {
                clarityScore: null,
                relevanceScore: null,
                difficultyLevel: null,
                userComment: '',
            };
            newMap.set(stepNumber, { ...current, [field]: value });
            return newMap;
        });
    };

    const submitFeedback = async (stepNumber: number) => {
        const feedback = feedbackForms.get(stepNumber);
        if (!feedback || !roadmapData) return;

        setFeedbackLoading(prev => new Map(prev).set(stepNumber, true));
        setFeedbackError(prev => {
            const newMap = new Map(prev);
            newMap.delete(stepNumber);
            return newMap;
        });

        try {
            // Prepare feedback data
            const feedbackData = {
                clarityScore: feedback.clarityScore,
                relevanceScore: feedback.relevanceScore,
                difficultyLevel: feedback.difficultyLevel,
                userComment: feedback.userComment,
            };

            // Call apply_feedback_fn API
            const response = await fetch(
                'http://127.0.0.1:7861/gradio_api/call/apply_feedback_fn',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        data: [
                            JSON.stringify(roadmapData), // Original Advisor Output (Full JSON)
                            stepNumber.toString(), // Step Number
                            JSON.stringify(feedbackData), // Feedback JSON
                            0.7, // Temperature (fixed)
                            8192, // Max Tokens (fixed)
                        ],
                    }),
                },
            );

            if (!response.ok) {
                throw new Error(`Feedback API error: ${response.status}`);
            }

            // Parse response to get event_id
            const responseText = await response.text();
            console.log('Feedback API initial response:', responseText);

            const eventIdMatch = responseText.match(/event_id["\s:]+([^"\s]+)/);
            if (!eventIdMatch) {
                throw new Error(
                    'Failed to get event_id from feedback API response',
                );
            }

            const eventId = eventIdMatch[1];
            console.log('Extracted feedback event ID:', eventId);

            // Poll for the result
            const maxAttempts = 60; // 5 minutes max for feedback
            let attempts = 0;

            while (attempts < maxAttempts) {
                attempts++;
                console.log(
                    `Polling feedback attempt ${attempts}/${maxAttempts} for event ${eventId}`,
                );

                await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay

                const pollResponse = await fetch(
                    `http://127.0.0.1:7861/gradio_api/call/apply_feedback_fn/${eventId}`,
                );

                if (pollResponse.ok) {
                    const pollText = await pollResponse.text();
                    console.log('Feedback poll response:', pollText);
                    const lines = pollText.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.substring(6);
                            console.log('Feedback SSE data line:', data);

                            if (data.trim() === '[DONE]') {
                                continue;
                            }

                            try {
                                const parsedData = JSON.parse(data);
                                console.log(
                                    'Parsed feedback SSE data:',
                                    parsedData,
                                );

                                // Check if this is the complete event with result
                                if (
                                    Array.isArray(parsedData) &&
                                    parsedData.length > 0
                                ) {
                                    const updatedStep = parsedData[0];

                                    // Update the roadmap data with the new step
                                    setRoadmapData(prevData => {
                                        if (!prevData?.learningPath?.steps)
                                            return prevData;

                                        const updatedSteps =
                                            prevData.learningPath.steps.map(
                                                step =>
                                                    step.stepNumber ===
                                                    stepNumber
                                                        ? {
                                                              ...step,
                                                              ...updatedStep,
                                                              feedback:
                                                                  feedbackData,
                                                          }
                                                        : step,
                                            );

                                        return {
                                            ...prevData,
                                            learningPath: {
                                                ...prevData.learningPath,
                                                steps: updatedSteps,
                                            },
                                        };
                                    });

                                    // Clear the feedback form for this step
                                    setFeedbackForms(prev => {
                                        const newMap = new Map(prev);
                                        newMap.set(stepNumber, {
                                            clarityScore: null,
                                            relevanceScore: null,
                                            difficultyLevel: null,
                                            userComment: '',
                                        });
                                        return newMap;
                                    });

                                    return;
                                }
                            } catch (parseError) {
                                console.error(
                                    'Error parsing feedback SSE data:',
                                    parseError,
                                );
                            }
                        }
                    }
                }
            }

            throw new Error('Timeout waiting for feedback response');
        } catch (err) {
            console.error('Error applying feedback:', err);
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'An error occurred while applying feedback';

            setFeedbackError(prev =>
                new Map(prev).set(stepNumber, errorMessage),
            );
        } finally {
            setFeedbackLoading(prev => {
                const newMap = new Map(prev);
                newMap.delete(stepNumber);
                return newMap;
            });
        }
    };

    if (!roadmapData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Brain className="w-12 h-12 text-primary animate-pulse" />
            </div>
        );
    }

    const { userProfile, learningPath, explainabilityMeta, aiReasoningTrace } =
        roadmapData;
    const steps = learningPath?.steps || [];

    return (
        <div className="container max-w-6xl mx-auto py-8 px-4">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <Button
                    variant="ghost"
                    onClick={() => router.push('/advisor')}
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Advisor
                </Button>

                <div className="flex items-start gap-4 mb-6">
                    <div className="p-4 bg-primary/10 rounded-lg">
                        <Brain className="w-10 h-10 text-primary" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-4xl font-bold mb-2">
                            {learningPath?.pathTitle || 'Your Career Roadmap'}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                            {learningPath?.duration && (
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{learningPath.duration}</span>
                                </div>
                            )}
                            {learningPath?.personalizationScore && (
                                <div className="flex items-center gap-2">
                                    <Target className="w-4 h-4" />
                                    <span>
                                        {learningPath.personalizationScore}%
                                        Personalized
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {userProfile && (
                    <Card className="p-6 mb-6 bg-primary/5 border-primary/20">
                        <h3 className="text-lg font-semibold mb-4">
                            Your Profile
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {userProfile.currentRole && (
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Current Role
                                    </p>
                                    <p className="font-medium">
                                        {userProfile.currentRole}
                                    </p>
                                </div>
                            )}
                            {userProfile.targetRole && (
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Target Role
                                    </p>
                                    <p className="font-medium">
                                        {userProfile.targetRole}
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>
                )}
            </motion.div>

            <div className="relative">
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-8">
                    <Lightbulb className="w-6 h-6 text-primary" />
                    Learning Path
                </h2>

                {/* Roadmap Timeline */}
                <div className="relative">
                    {/* Vertical Timeline Line */}
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-primary/20"></div>

                    <div className="space-y-12">
                        {steps.map((step, index) => {
                            const isExpanded = expandedSteps.has(
                                step.stepNumber,
                            );
                            const isCompleted = stepProgress.get(
                                step.stepNumber,
                            );
                            const feedback = feedbackForms.get(step.stepNumber);

                            return (
                                <motion.div
                                    key={step.stepNumber}
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.2 }}
                                    className="relative flex items-start gap-6"
                                >
                                    {/* Timeline Node */}
                                    <div className="flex-shrink-0 relative">
                                        <div
                                            className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg border-4 transition-all duration-300 ${
                                                isCompleted
                                                    ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/30'
                                                    : 'bg-background border-primary text-primary shadow-lg shadow-primary/20'
                                            }`}
                                        >
                                            {isCompleted ? (
                                                <CheckCircle2 className="w-8 h-8" />
                                            ) : (
                                                step.stepNumber
                                            )}
                                        </div>
                                        {index < steps.length - 1 && (
                                            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-0.5 h-12 bg-primary/30"></div>
                                        )}
                                    </div>

                                    {/* Step Content */}
                                    <div className="flex-1 min-w-0">
                                        <Card
                                            className={`transition-all duration-300 hover:shadow-lg ${isCompleted ? 'border-green-500/50 bg-green-500/5' : 'hover:border-primary/50'}`}
                                        >
                                            <button
                                                onClick={() =>
                                                    toggleStep(step.stepNumber)
                                                }
                                                className="w-full p-6 text-left hover:bg-accent/50 transition-colors rounded-t-lg"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                                                            {step.title}
                                                            {isCompleted && (
                                                                <Badge
                                                                    variant="secondary"
                                                                    className="bg-green-500/10 text-green-700"
                                                                >
                                                                    Completed
                                                                </Badge>
                                                            )}
                                                        </h3>
                                                        <p className="text-muted-foreground mb-3">
                                                            {step.description}
                                                        </p>
                                                        <div className="flex flex-wrap items-center gap-4 text-sm">
                                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                                <Clock className="w-4 h-4" />
                                                                {step.duration}
                                                            </div>
                                                            {step.skillsTargeted
                                                                ?.length >
                                                                0 && (
                                                                <div className="flex flex-wrap gap-2">
                                                                    {step.skillsTargeted.map(
                                                                        (
                                                                            skill,
                                                                            idx,
                                                                        ) => (
                                                                            <Badge
                                                                                key={
                                                                                    idx
                                                                                }
                                                                                variant="secondary"
                                                                            >
                                                                                {
                                                                                    skill
                                                                                }
                                                                            </Badge>
                                                                        ),
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex-shrink-0 ml-4">
                                                        <TrendingUp
                                                            className={`w-6 h-6 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                                                        />
                                                    </div>
                                                </div>
                                            </button>

                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{
                                                            height: 0,
                                                            opacity: 0,
                                                        }}
                                                        animate={{
                                                            height: 'auto',
                                                            opacity: 1,
                                                        }}
                                                        exit={{
                                                            height: 0,
                                                            opacity: 0,
                                                        }}
                                                        className="border-t"
                                                    >
                                                        <div className="p-6 space-y-6">
                                                            {step
                                                                .recommendedResources
                                                                ?.length >
                                                                0 && (
                                                                <div>
                                                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                                                        <BookOpen className="w-5 h-5 text-primary" />
                                                                        Recommended
                                                                        Resources
                                                                    </h4>
                                                                    <div className="grid gap-3 md:grid-cols-2">
                                                                        {step.recommendedResources.map(
                                                                            (
                                                                                resource,
                                                                                idx,
                                                                            ) => (
                                                                                <Card
                                                                                    key={
                                                                                        idx
                                                                                    }
                                                                                    className="p-4 hover:shadow-md transition-shadow"
                                                                                >
                                                                                    <div className="flex items-start gap-3">
                                                                                        <div className="p-2 bg-primary/10 rounded-lg">
                                                                                            {getResourceIcon(
                                                                                                resource.type,
                                                                                            )}
                                                                                        </div>
                                                                                        <div className="flex-1 min-w-0">
                                                                                            <Badge
                                                                                                variant="outline"
                                                                                                className="mb-2"
                                                                                            >
                                                                                                {
                                                                                                    resource.type
                                                                                                }
                                                                                            </Badge>
                                                                                            <h5 className="font-semibold mb-1 truncate">
                                                                                                {
                                                                                                    resource.title
                                                                                                }
                                                                                            </h5>
                                                                                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                                                                                {
                                                                                                    resource.explanation
                                                                                                }
                                                                                            </p>
                                                                                            <Button
                                                                                                size="sm"
                                                                                                variant="ghost"
                                                                                                onClick={() =>
                                                                                                    window.open(
                                                                                                        resource.url,
                                                                                                        '_blank',
                                                                                                    )
                                                                                                }
                                                                                                className="p-0 h-auto"
                                                                                            >
                                                                                                <ExternalLink className="w-4 h-4 mr-2" />
                                                                                                Open
                                                                                            </Button>
                                                                                        </div>
                                                                                    </div>
                                                                                </Card>
                                                                            ),
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <Card className="p-4 bg-accent/30">
                                                                <h5 className="font-semibold mb-4 flex items-center gap-2">
                                                                    <MessageSquare className="w-5 h-5 text-primary" />
                                                                    Provide
                                                                    Feedback
                                                                </h5>
                                                                <div className="space-y-4">
                                                                    <div>
                                                                        <Label className="mb-2 block">
                                                                            Clarity
                                                                            (1-5)
                                                                        </Label>
                                                                        <div className="flex gap-2">
                                                                            {[
                                                                                1,
                                                                                2,
                                                                                3,
                                                                                4,
                                                                                5,
                                                                            ].map(
                                                                                rating => (
                                                                                    <button
                                                                                        key={
                                                                                            rating
                                                                                        }
                                                                                        type="button"
                                                                                        onClick={() =>
                                                                                            updateFeedback(
                                                                                                step.stepNumber,
                                                                                                'clarityScore',
                                                                                                rating,
                                                                                            )
                                                                                        }
                                                                                        className={`p-2 rounded transition-colors ${feedback?.clarityScore === rating ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-400'}`}
                                                                                        disabled={feedbackLoading.get(
                                                                                            step.stepNumber,
                                                                                        )}
                                                                                    >
                                                                                        <Star
                                                                                            className={`w-6 h-6 ${feedback?.clarityScore === rating ? 'fill-yellow-500' : ''}`}
                                                                                        />
                                                                                    </button>
                                                                                ),
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <Label className="mb-2 block">
                                                                            Difficulty
                                                                        </Label>
                                                                        <div className="flex gap-2">
                                                                            {[
                                                                                'too easy',
                                                                                'appropriate',
                                                                                'too hard',
                                                                            ].map(
                                                                                level => (
                                                                                    <Button
                                                                                        key={
                                                                                            level
                                                                                        }
                                                                                        type="button"
                                                                                        size="sm"
                                                                                        variant={
                                                                                            feedback?.difficultyLevel ===
                                                                                            level
                                                                                                ? 'default'
                                                                                                : 'outline'
                                                                                        }
                                                                                        onClick={() =>
                                                                                            updateFeedback(
                                                                                                step.stepNumber,
                                                                                                'difficultyLevel',
                                                                                                level,
                                                                                            )
                                                                                        }
                                                                                        disabled={feedbackLoading.get(
                                                                                            step.stepNumber,
                                                                                        )}
                                                                                    >
                                                                                        {
                                                                                            level
                                                                                        }
                                                                                    </Button>
                                                                                ),
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <Label
                                                                            htmlFor={`comment-${step.stepNumber}`}
                                                                        >
                                                                            Comments
                                                                        </Label>
                                                                        <Textarea
                                                                            id={`comment-${step.stepNumber}`}
                                                                            value={
                                                                                feedback?.userComment ||
                                                                                ''
                                                                            }
                                                                            onChange={e =>
                                                                                updateFeedback(
                                                                                    step.stepNumber,
                                                                                    'userComment',
                                                                                    e
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            placeholder="Share your thoughts..."
                                                                            className="min-h-20"
                                                                            disabled={feedbackLoading.get(
                                                                                step.stepNumber,
                                                                            )}
                                                                        />
                                                                    </div>

                                                                    {feedbackError.get(
                                                                        step.stepNumber,
                                                                    ) && (
                                                                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                                                                            <p className="text-sm text-destructive">
                                                                                {feedbackError.get(
                                                                                    step.stepNumber,
                                                                                )}
                                                                            </p>
                                                                        </div>
                                                                    )}

                                                                    <Button
                                                                        onClick={() =>
                                                                            submitFeedback(
                                                                                step.stepNumber,
                                                                            )
                                                                        }
                                                                        disabled={feedbackLoading.get(
                                                                            step.stepNumber,
                                                                        )}
                                                                        className="w-full"
                                                                    >
                                                                        {feedbackLoading.get(
                                                                            step.stepNumber,
                                                                        ) ? (
                                                                            <>
                                                                                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                                                Applying
                                                                                Feedback...
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Send className="w-4 h-4 mr-2" />
                                                                                Submit
                                                                                Feedback
                                                                            </>
                                                                        )}
                                                                    </Button>
                                                                </div>
                                                            </Card>

                                                            <Button
                                                                onClick={() =>
                                                                    toggleStepCompletion(
                                                                        step.stepNumber,
                                                                    )
                                                                }
                                                                variant={
                                                                    isCompleted
                                                                        ? 'default'
                                                                        : 'outline'
                                                                }
                                                                className="w-full"
                                                            >
                                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                                {isCompleted
                                                                    ? 'Completed'
                                                                    : 'Mark as Complete'}
                                                            </Button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </Card>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {aiReasoningTrace && aiReasoningTrace.length > 0 && (
                <Card className="p-6 mb-8 bg-purple-500/5 border-purple-500/20">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Brain className="w-6 h-6 text-purple-500" />
                        AI Reasoning
                    </h3>
                    <div className="space-y-4">
                        {aiReasoningTrace.map((trace, idx) => (
                            <div
                                key={idx}
                                className="p-4 bg-background/50 rounded-lg border"
                            >
                                <Badge variant="outline" className="mb-2">
                                    Gap {trace.step}
                                </Badge>
                                <h4 className="font-semibold mb-2">
                                    {trace.identifiedGap}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    <strong>Why:</strong>{' '}
                                    {trace.modelExplanation}
                                </p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {explainabilityMeta && (
                <Card className="p-6 bg-accent/30">
                    <h3 className="text-lg font-semibold mb-4">
                        About This Roadmap
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-muted-foreground">Technique</p>
                            <p className="font-medium">
                                {explainabilityMeta.technique}
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground">Method</p>
                            <p className="font-medium">
                                {explainabilityMeta.method}
                            </p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}

export default function CareerAdvisorResultsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CareerAdvisorResultsPageContent />
        </Suspense>
    );
}
