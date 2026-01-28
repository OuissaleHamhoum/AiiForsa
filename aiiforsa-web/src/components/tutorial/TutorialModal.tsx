'use client';

/**
 * Tutorial Modal Component
 * Displays tutorial content with steps and navigation
 */

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useTutorial, type TutorialFeature } from './TutorialContext';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface TutorialStep {
    title: string;
    content: string;
    image?: string;
    highlight?: string; // CSS selector to highlight
}

interface TutorialData {
    title: string;
    description: string;
    steps: TutorialStep[];
}

const TUTORIAL_CONTENT: Record<TutorialFeature, TutorialData> = {
    welcome: {
        title: 'Welcome to AIIForSA!',
        description:
            "Your AI-powered career companion - let's get you started!",
        steps: [
            {
                title: 'Your Career Dashboard',
                content:
                    'This is your main dashboard where you can track your career progress, view achievements, and access all features.',
                highlight: '[data-tutorial="dashboard"]',
            },
            {
                title: 'Navigation',
                content:
                    'Use the navigation bar above to access different features like Resume Builder, Job Search, Career Advisor, and more.',
                highlight: '[data-tutorial="navbar"]',
            },
            {
                title: 'XP & Achievements',
                content:
                    'Earn XP points and unlock achievements as you use the platform. Check your progress in the sidebar.',
                highlight: '[data-tutorial="xp"]',
            },
            {
                title: 'Resume Builder',
                content:
                    'Create professional resumes with AI assistance. Choose templates, get content suggestions, and optimize for ATS systems.',
            },
            {
                title: 'Job Search & Matching',
                content:
                    'Find relevant job opportunities with our AI matching system. See how well your CV matches each job and apply directly.',
            },
            {
                title: 'Career Advisor',
                content:
                    'Get personalized career guidance with AI analysis of your profile, skill gaps, and career path recommendations.',
            },
            {
                title: 'Interview Preparation',
                content:
                    'Practice real-time voice interviews or text-based interviews with our AI interviewer. Get detailed feedback and reports.',
            },
            {
                title: 'Learning Hub',
                content:
                    'Access courses, articles, and resources to develop skills. Track your learning progress and earn XP.',
            },
            {
                title: 'Career Challenges',
                content:
                    'Complete daily and skill challenges to build good habits, earn XP, and unlock achievements.',
            },
            {
                title: 'Community',
                content:
                    'Connect with other professionals, participate in discussions, and find mentorship opportunities.',
            },
            {
                title: 'Track Your Applications',
                content:
                    'Keep track of all your job applications, add manual entries, and view application analytics.',
            },
            {
                title: 'Ready to Start!',
                content:
                    "You're all set! Explore the features, earn XP, and advance your career with AIIForSA. You can always access this tutorial again from the help menu.",
            },
        ],
    },
};

export function TutorialModal() {
    const { currentTutorial, closeTutorial, markTutorialComplete } =
        useTutorial();
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        setCurrentStep(0);
    }, [currentTutorial]);

    // Highlight effect for tutorial elements
    useEffect(() => {
        if (!currentTutorial) return;

        const tutorial = TUTORIAL_CONTENT[currentTutorial];
        const step = tutorial.steps[currentStep];
        const highlightSelector = step.highlight;

        if (highlightSelector) {
            const element = document.querySelector(highlightSelector);
            if (element) {
                // Add highlight class
                element.classList.add('tutorial-highlight');

                // Scroll element into view
                element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'center',
                });
            }
        }

        // Cleanup function
        return () => {
            if (highlightSelector) {
                const element = document.querySelector(highlightSelector);
                if (element) {
                    element.classList.remove('tutorial-highlight');
                }
            }
        };
    }, [currentTutorial, currentStep]);

    if (!currentTutorial) return null;

    const tutorial = TUTORIAL_CONTENT[currentTutorial];
    const step = tutorial.steps[currentStep];
    const isLastStep = currentStep === tutorial.steps.length - 1;

    const handleNext = () => {
        if (isLastStep) {
            markTutorialComplete(currentTutorial);
        } else {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        setCurrentStep(prev => Math.max(0, prev - 1));
    };

    const handleSkip = () => {
        markTutorialComplete(currentTutorial);
    };

    return (
        <Dialog open={!!currentTutorial} onOpenChange={() => closeTutorial()}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">
                                {tutorial.title}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                                {tutorial.description}
                            </p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSkip}
                            className="h-8 w-8 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Progress indicator */}
                    <div className="flex items-center space-x-2">
                        {tutorial.steps.map((_, index) => (
                            <div
                                key={index}
                                className={`h-2 flex-1 rounded-full ${
                                    index <= currentStep
                                        ? 'bg-primary'
                                        : 'bg-muted'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Step content */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">{step.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            {step.content}
                        </p>
                        {step.image && (
                            <div className="rounded-lg overflow-hidden border">
                                <img
                                    src={step.image}
                                    alt={step.title}
                                    className="w-full h-auto"
                                />
                            </div>
                        )}
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                onClick={handleSkip}
                                size="sm"
                            >
                                Skip Tutorial
                            </Button>
                        </div>

                        <div className="flex space-x-2">
                            <Button
                                variant="outline"
                                onClick={handlePrevious}
                                disabled={currentStep === 0}
                                size="sm"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </Button>
                            <Button onClick={handleNext} size="sm">
                                {isLastStep ? 'Finish' : 'Next'}
                                {!isLastStep && (
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
