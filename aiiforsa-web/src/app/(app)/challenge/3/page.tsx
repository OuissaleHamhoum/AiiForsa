'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, Trophy, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

interface Technology {
    id: string;
    name: string;
    logo: string;
    color: string;
}

const TECHNOLOGIES: Technology[] = [
    {
        id: 'javascript',
        name: 'JavaScript',
        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
        color: '#F7DF1E',
    },
    {
        id: 'react',
        name: 'React',
        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
        color: '#61DAFB',
    },
    {
        id: 'nodejs',
        name: 'Node.js',
        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
        color: '#339933',
    },
    {
        id: 'python',
        name: 'Python',
        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
        color: '#3776AB',
    },
    {
        id: 'typescript',
        name: 'TypeScript',
        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
        color: '#3178C6',
    },
    {
        id: 'vue',
        name: 'Vue.js',
        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
        color: '#42B883',
    },
    {
        id: 'angular',
        name: 'Angular',
        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg',
        color: '#DD0031',
    },
    {
        id: 'mongodb',
        name: 'MongoDB',
        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
        color: '#47A248',
    },
];

interface Question {
    techId: string;
    techName: string;
}

export default function LogoMatchChallengePage() {
    const router = useRouter();
    const [questions, setQuestions] = React.useState<Question[]>([]);

    // Generate questions on client side only to avoid hydration mismatch
    React.useEffect(() => {
        const shuffled = [...TECHNOLOGIES].sort(() => Math.random() - 0.5);
        setQuestions(
            shuffled.slice(0, 6).map(tech => ({
                techId: tech.id,
                techName: tech.name,
            })),
        );
    }, []);

    const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
    const [selectedId, setSelectedId] = React.useState<string | null>(null);
    const [isChecked, setIsChecked] = React.useState(false);
    const [isCorrect, setIsCorrect] = React.useState(false);
    const [score, setScore] = React.useState(0);
    const [showResult, setShowResult] = React.useState(false);
    const [correctAnswers, setCorrectAnswers] = React.useState<Set<string>>(
        new Set(),
    );
    const [wrongAnswers, setWrongAnswers] = React.useState<Set<string>>(
        new Set(),
    );

    const currentQuestion = questions[currentQuestionIndex];
    const progress =
        questions.length > 0
            ? ((currentQuestionIndex + 1) / questions.length) * 100
            : 0;

    const handleSelectLogo = (techId: string) => {
        if (isChecked) return;
        setSelectedId(techId);
    };

    const handleCheckAnswer = () => {
        if (!selectedId || !currentQuestion) return;

        const correct = selectedId === currentQuestion.techId;
        setIsCorrect(correct);
        setIsChecked(true);

        if (correct) {
            setScore(score + 1);
            setCorrectAnswers(new Set([...correctAnswers, selectedId]));
        } else {
            setWrongAnswers(new Set([...wrongAnswers, selectedId]));
        }
    };

    const handleContinue = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedId(null);
            setIsChecked(false);
            setIsCorrect(false);
        } else {
            setShowResult(true);
        }
    };

    const handleRestart = () => {
        window.location.reload();
    };

    // Show loading state while questions are being generated
    if (questions.length === 0) {
        return (
            <div className="min-h-screen py-8">
                <div className="container mx-auto max-w-4xl px-4">
                    <div className="flex min-h-[400px] items-center justify-center">
                        <div className="text-center">
                            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#e67320]/20 border-t-[#e67320]" />
                            <p className="text-white/60">
                                Loading challenge...
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (showResult) {
        const percentage = Math.round((score / questions.length) * 100);
        const isPerfect = score === questions.length;

        return (
            <div className="min-h-screen py-8">
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
                            {isPerfect
                                ? '🎉 Perfect Score!'
                                : 'Challenge Complete!'}
                        </h1>
                        <p className="mb-8 text-white/60">
                            {isPerfect
                                ? 'Amazing! You matched all logos correctly!'
                                : 'Great effort! Keep learning these technologies.'}
                        </p>

                        <div className="mb-8 rounded-xl p-8">
                            <p className="mb-2 text-sm font-medium text-white/60">
                                Your Score
                            </p>
                            <p className="text-6xl font-bold text-[#e67320]">
                                {score}/{questions.length}
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
        <div className="min-h-screen py-8">
            <div className="container mx-auto max-w-4xl px-4">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <Button
                        onClick={() => router.push('/challenge')}
                        variant="ghost"
                        className="text-white/60 hover:bg-white/10 hover:text-white"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Exit Challenge
                    </Button>
                    <div className="text-right">
                        <p className="text-sm text-white/60">Question</p>
                        <p className="text-lg font-bold text-white">
                            {currentQuestionIndex + 1} / {questions.length}
                        </p>
                    </div>
                </div>

                {/* Progress */}
                <div className="mb-8">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                            className="h-full bg-[#e67320] transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion.techId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="p-8">
                            {/* Question */}
                            <div className="mb-8 text-center">
                                <h2 className="mb-2 text-3xl font-bold text-white">
                                    Which logo represents
                                </h2>
                                <motion.p
                                    key={currentQuestion.techName}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-5xl font-bold text-[#e67320]"
                                >
                                    {currentQuestion.techName}
                                </motion.p>
                            </div>

                            {/* Logo Grid - 2 rows of 4 */}
                            <div className="mb-8 space-y-4">
                                {/* First Row */}
                                <div className="grid grid-cols-4 gap-4">
                                    {TECHNOLOGIES.slice(0, 4).map(tech => {
                                        const isSelected =
                                            selectedId === tech.id;
                                        const isCorrectLogo =
                                            tech.id === currentQuestion.techId;
                                        const showCorrect =
                                            isChecked && isCorrectLogo;
                                        const showWrong =
                                            isChecked &&
                                            isSelected &&
                                            !isCorrectLogo;
                                        const wasCorrectBefore =
                                            correctAnswers.has(tech.id);
                                        const wasWrongBefore = wrongAnswers.has(
                                            tech.id,
                                        );

                                        return (
                                            <motion.button
                                                key={tech.id}
                                                onClick={() =>
                                                    handleSelectLogo(tech.id)
                                                }
                                                disabled={isChecked}
                                                whileHover={
                                                    !isChecked
                                                        ? { scale: 1.05 }
                                                        : {}
                                                }
                                                whileTap={
                                                    !isChecked
                                                        ? { scale: 0.95 }
                                                        : {}
                                                }
                                                className={`relative aspect-square rounded-xl border-2 p-2 transition-all ${
                                                    showCorrect
                                                        ? 'border-green-500 bg-green-500/20'
                                                        : showWrong
                                                          ? 'border-red-500 bg-red-500/20'
                                                          : isSelected
                                                            ? 'border-[#e67320] bg-[#e67320]/20'
                                                            : wasCorrectBefore
                                                              ? 'border-green-500/30 bg-green-500/10 opacity-50'
                                                              : wasWrongBefore
                                                                ? 'border-red-500/30 bg-red-500/10 opacity-50'
                                                                : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                                                } ${isChecked ? 'cursor-default' : 'cursor-pointer'}`}
                                            >
                                                <div className="flex h-full items-center justify-center rounded-lg bg-white/5 p-4">
                                                    <img
                                                        src={tech.logo}
                                                        alt={tech.name}
                                                        className="h-full w-full object-contain"
                                                    />
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
                                                        className="absolute right-2 top-2 rounded-full bg-green-500 p-1"
                                                    >
                                                        <Check className="h-5 w-5 text-white" />
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
                                                        className="absolute right-2 top-2 rounded-full bg-red-500 p-1"
                                                    >
                                                        <X className="h-5 w-5 text-white" />
                                                    </motion.div>
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {/* Second Row */}
                                <div className="grid grid-cols-4 gap-4">
                                    {TECHNOLOGIES.slice(4, 8).map(tech => {
                                        const isSelected =
                                            selectedId === tech.id;
                                        const isCorrectLogo =
                                            tech.id === currentQuestion.techId;
                                        const showCorrect =
                                            isChecked && isCorrectLogo;
                                        const showWrong =
                                            isChecked &&
                                            isSelected &&
                                            !isCorrectLogo;
                                        const wasCorrectBefore =
                                            correctAnswers.has(tech.id);
                                        const wasWrongBefore = wrongAnswers.has(
                                            tech.id,
                                        );

                                        return (
                                            <motion.button
                                                key={tech.id}
                                                onClick={() =>
                                                    handleSelectLogo(tech.id)
                                                }
                                                disabled={isChecked}
                                                whileHover={
                                                    !isChecked
                                                        ? { scale: 1.05 }
                                                        : {}
                                                }
                                                whileTap={
                                                    !isChecked
                                                        ? { scale: 0.95 }
                                                        : {}
                                                }
                                                className={`relative aspect-square rounded-xl border-2 p-2 transition-all ${
                                                    showCorrect
                                                        ? 'border-green-500 bg-green-500/20'
                                                        : showWrong
                                                          ? 'border-red-500 bg-red-500/20'
                                                          : isSelected
                                                            ? 'border-[#e67320] bg-[#e67320]/20'
                                                            : wasCorrectBefore
                                                              ? 'border-green-500/30 bg-green-500/10 opacity-50'
                                                              : wasWrongBefore
                                                                ? 'border-red-500/30 bg-red-500/10 opacity-50'
                                                                : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                                                } ${isChecked ? 'cursor-default' : 'cursor-pointer'}`}
                                            >
                                                <div className="flex h-full items-center justify-center rounded-lg bg-white/5 p-4">
                                                    <img
                                                        src={tech.logo}
                                                        alt={tech.name}
                                                        className="h-full w-full object-contain"
                                                    />
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
                                                        className="absolute right-2 top-2 rounded-full bg-green-500 p-1"
                                                    >
                                                        <Check className="h-5 w-5 text-white" />
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
                                                        className="absolute right-2 top-2 rounded-full bg-red-500 p-1"
                                                    >
                                                        <X className="h-5 w-5 text-white" />
                                                    </motion.div>
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Check Answer Button or Continue */}
                            {!isChecked ? (
                                <Button
                                    onClick={handleCheckAnswer}
                                    disabled={!selectedId}
                                    className="w-full bg-[#e67320] text-[#0a0a0a] hover:bg-[#cf6318] disabled:opacity-50"
                                    size="lg"
                                >
                                    Check Answer
                                </Button>
                            ) : (
                                <div className="space-y-4">
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className={`rounded-lg border p-4 text-center ${
                                            isCorrect
                                                ? 'border-green-500 bg-green-500/20'
                                                : 'border-red-500 bg-red-500/20'
                                        }`}
                                    >
                                        <p className="text-xl font-bold text-white">
                                            {isCorrect
                                                ? '✅ Correct!'
                                                : '❌ Wrong Answer'}
                                        </p>
                                    </motion.div>

                                    <Button
                                        onClick={handleContinue}
                                        className="w-full bg-[#e67320] text-[#0a0a0a] hover:bg-[#cf6318]"
                                        size="lg"
                                    >
                                        {currentQuestionIndex <
                                        questions.length - 1
                                            ? 'Continue'
                                            : 'See Results'}
                                    </Button>
                                </div>
                            )}

                            {/* Score Indicator */}
                            <div className="mt-4 text-center">
                                <p className="text-sm text-white/60">
                                    Current Score:{' '}
                                    <span className="font-bold text-[#e67320]">
                                        {score} /{' '}
                                        {currentQuestionIndex +
                                            (isChecked ? 1 : 0)}
                                    </span>
                                </p>
                            </div>
                        </Card>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
