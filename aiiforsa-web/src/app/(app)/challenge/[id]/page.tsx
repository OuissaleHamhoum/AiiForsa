'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, Trophy, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

const EASY_QUIZ_QUESTIONS = [
    {
        id: 'q1',
        question: 'What does HTML stand for?',
        options: [
            'Hyper Text Markup Language',
            'High Tech Modern Language',
            'Home Tool Markup Language',
            'Hyperlinks and Text Markup Language',
        ],
        correctAnswer: 'Hyper Text Markup Language',
    },
    {
        id: 'q2',
        question: 'Which CSS property is used to change the text color?',
        options: ['text-color', 'color', 'font-color', 'text-style'],
        correctAnswer: 'color',
    },
    {
        id: 'q3',
        question: 'What does CSS stand for?',
        options: [
            'Creative Style Sheets',
            'Cascading Style Sheets',
            'Computer Style Sheets',
            'Colorful Style Sheets',
        ],
        correctAnswer: 'Cascading Style Sheets',
    },
    {
        id: 'q4',
        question:
            'Which JavaScript method is used to write into an HTML element?',
        options: [
            'document.write()',
            'innerHTML',
            'console.log()',
            'document.getElementById()',
        ],
        correctAnswer: 'innerHTML',
    },
    {
        id: 'q5',
        question: 'What is the correct HTML tag for inserting a line break?',
        options: ['<break>', '<lb>', '<br>', '<newline>'],
        correctAnswer: '<br>',
    },
    {
        id: 'q6',
        question: 'Which symbol is used for comments in JavaScript?',
        options: ['<!-- -->', '//', '/* */', 'Both // and /* */'],
        correctAnswer: 'Both // and /* */',
    },
    {
        id: 'q7',
        question: 'What does DOM stand for in web development?',
        options: [
            'Document Object Model',
            'Data Object Management',
            'Digital Online Media',
            'Document Oriented Markup',
        ],
        correctAnswer: 'Document Object Model',
    },
    {
        id: 'q8',
        question:
            'Which HTML attribute specifies an alternate text for an image?',
        options: ['alt', 'title', 'src', 'longdesc'],
        correctAnswer: 'alt',
    },
    {
        id: 'q9',
        question:
            'What is the correct CSS syntax for making all <p> elements bold?',
        options: [
            'p {font-weight: bold;}',
            '<p style="font-weight:bold">',
            'p {text-size: bold;}',
            '<p font="bold">',
        ],
        correctAnswer: 'p {font-weight: bold;}',
    },
    {
        id: 'q10',
        question:
            'Which JavaScript operator is used to assign a value to a variable?',
        options: ['=', '==', '===', ':'],
        correctAnswer: '=',
    },
];

export default function ChallengeQuizPage({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const router = useRouter();
    const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
    const [selectedAnswer, setSelectedAnswer] = React.useState<string | null>(
        null,
    );
    const [isAnswered, setIsAnswered] = React.useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isCorrect, setIsCorrect] = React.useState(false);
    const [score, setScore] = React.useState(0);
    const [showResult, setShowResult] = React.useState(false);

    const currentQuestion = EASY_QUIZ_QUESTIONS[currentQuestionIndex];
    const progress =
        ((currentQuestionIndex + 1) / EASY_QUIZ_QUESTIONS.length) * 100;

    const handleAnswerSelect = (answer: string) => {
        if (isAnswered) return;

        setSelectedAnswer(answer);
        const correct = answer === currentQuestion.correctAnswer;
        setIsCorrect(correct);
        setIsAnswered(true);

        if (correct) {
            setScore(score + 1);
        }
    };

    const handleContinue = () => {
        if (currentQuestionIndex < EASY_QUIZ_QUESTIONS.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
            setIsCorrect(false);
        } else {
            setShowResult(true);
        }
    };

    const handleRestart = () => {
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
        setIsCorrect(false);
        setScore(0);
        setShowResult(false);
    };

    if (showResult) {
        const percentage = Math.round(
            (score / EASY_QUIZ_QUESTIONS.length) * 100,
        );
        const isPerfect = score === EASY_QUIZ_QUESTIONS.length;

        return (
            <div className="min-h-screen bg-[#1a1a1a] py-8">
                <div className="container mx-auto max-w-2xl px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-2xl p-8 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className="mb-6 inline-block rounded-full bg-[#e67320]/20 p-6"
                        >
                            <Trophy className="h-16 w-16 text-[#e67320]" />
                        </motion.div>

                        <h1 className="mb-2 text-4xl font-bold text-white">
                            {isPerfect ? '🎉 Perfect Score!' : 'Quiz Complete!'}
                        </h1>
                        <p className="mb-8 text-white/60">
                            {isPerfect
                                ? 'Amazing! You got every question right!'
                                : 'Great effort! Keep practicing to improve.'}
                        </p>

                        <div className="mb-8 rounded-xl p-8">
                            <p className="mb-2 text-sm font-medium text-white/60">
                                Your Score
                            </p>
                            <p className="text-6xl font-bold text-[#e67320]">
                                {score}/{EASY_QUIZ_QUESTIONS.length}
                            </p>
                            <p className="mt-2 text-2xl text-white">
                                {percentage}%
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                onClick={() => router.push('/challenge')}
                                variant="outline"
                                className="flex-1 border-white/20 bg-white/5 text-white hover:bg-white/10"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Challenges
                            </Button>
                            <Button
                                onClick={handleRestart}
                                className="flex-1 bg-[#e67320] text-[#0a0a0a] hover:bg-[#cf6318]"
                            >
                                Try Again
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1a1a1a] py-8">
            <div className="container mx-auto max-w-3xl px-4">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <Button
                        onClick={() => router.push('/challenge')}
                        variant="ghost"
                        className="text-white/60 hover:bg-white/10 hover:text-white"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Exit Quiz
                    </Button>
                    <div className="text-right">
                        <p className="text-sm text-white/60">Question</p>
                        <p className="text-lg font-bold text-white">
                            {currentQuestionIndex + 1} /{' '}
                            {EASY_QUIZ_QUESTIONS.length}
                        </p>
                    </div>
                </div>

                {/* Progress */}
                <div className="mb-8">
                    <Progress value={progress} className="h-2" />
                </div>

                {/* Question Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion.id}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="p-8">
                            {/* Question */}
                            <h2 className="mb-8 text-2xl font-bold text-white">
                                {currentQuestion.question}
                            </h2>

                            {/* Options */}
                            <div className="space-y-3">
                                {currentQuestion.options.map(
                                    (option, index) => {
                                        const isSelected =
                                            selectedAnswer === option;
                                        const isCorrectOption =
                                            option ===
                                            currentQuestion.correctAnswer;
                                        const showCorrect =
                                            isAnswered && isCorrectOption;
                                        const showWrong =
                                            isAnswered &&
                                            isSelected &&
                                            !isCorrectOption;

                                        return (
                                            <motion.button
                                                key={option}
                                                onClick={() =>
                                                    handleAnswerSelect(option)
                                                }
                                                disabled={isAnswered}
                                                whileHover={
                                                    !isAnswered
                                                        ? { scale: 1.02 }
                                                        : {}
                                                }
                                                whileTap={
                                                    !isAnswered
                                                        ? { scale: 0.98 }
                                                        : {}
                                                }
                                                className={`w-full rounded-lg border p-4 text-left transition-all ${
                                                    showCorrect
                                                        ? 'border-green-500 bg-green-500/20'
                                                        : showWrong
                                                          ? 'border-red-500 bg-red-500/20'
                                                          : isSelected
                                                            ? 'border-[#e67320] bg-[#e67320]/10'
                                                            : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                                                } ${isAnswered ? 'cursor-default' : 'cursor-pointer'}`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                                                                showCorrect
                                                                    ? 'border-green-500 bg-green-500'
                                                                    : showWrong
                                                                      ? 'border-red-500 bg-red-500'
                                                                      : 'border-white/20 bg-white/5'
                                                            }`}
                                                        >
                                                            <span
                                                                className={`text-sm font-semibold ${
                                                                    showCorrect ||
                                                                    showWrong
                                                                        ? 'text-white'
                                                                        : 'text-white/60'
                                                                }`}
                                                            >
                                                                {String.fromCharCode(
                                                                    65 + index,
                                                                )}
                                                            </span>
                                                        </div>
                                                        <span className="text-white">
                                                            {option}
                                                        </span>
                                                    </div>
                                                    {showCorrect && (
                                                        <motion.div
                                                            initial={{
                                                                scale: 0,
                                                                rotate: -180,
                                                            }}
                                                            animate={{
                                                                scale: 1,
                                                                rotate: 0,
                                                            }}
                                                            transition={{
                                                                type: 'spring',
                                                            }}
                                                        >
                                                            <Check className="h-6 w-6 text-green-500" />
                                                        </motion.div>
                                                    )}
                                                    {showWrong && (
                                                        <motion.div
                                                            initial={{
                                                                scale: 0,
                                                                rotate: -180,
                                                            }}
                                                            animate={{
                                                                scale: 1,
                                                                rotate: 0,
                                                            }}
                                                            transition={{
                                                                type: 'spring',
                                                            }}
                                                        >
                                                            <X className="h-6 w-6 text-red-500" />
                                                        </motion.div>
                                                    )}
                                                </div>
                                            </motion.button>
                                        );
                                    },
                                )}
                            </div>

                            {/* Continue Button */}
                            {isAnswered && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-8"
                                >
                                    <Button
                                        onClick={handleContinue}
                                        className="w-full bg-[#e67320] text-[#0a0a0a] hover:bg-[#cf6318]"
                                        size="lg"
                                    >
                                        {currentQuestionIndex <
                                        EASY_QUIZ_QUESTIONS.length - 1
                                            ? 'Continue'
                                            : 'See Results'}
                                    </Button>
                                </motion.div>
                            )}
                        </Card>

                        {/* Score Indicator */}
                        <div className="mt-4 text-center">
                            <p className="text-sm text-white/60">
                                Current Score:{' '}
                                <span className="font-bold text-[#e67320]">
                                    {score} /{' '}
                                    {currentQuestionIndex +
                                        (isAnswered ? 1 : 0)}
                                </span>
                            </p>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
