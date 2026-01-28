'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, HelpCircle, Trophy, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';

interface CrosswordWord {
    id: number;
    word: string;
    definition: string;
    startRow: number;
    startCol: number;
    direction: 'horizontal' | 'vertical';
}

const CROSSWORD_WORDS: CrosswordWord[] = [
    {
        id: 1,
        word: 'JAVASCRIPT',
        definition: 'Popular programming language for web development',
        startRow: 0,
        startCol: 0,
        direction: 'horizontal',
    },
    {
        id: 2,
        word: 'PYTHON',
        definition: 'High-level programming language known for simplicity',
        startRow: 3,
        startCol: 2,
        direction: 'horizontal',
    },
    {
        id: 3,
        word: 'HTML',
        definition: 'Markup language for creating web pages',
        startRow: 5,
        startCol: 0,
        direction: 'horizontal',
    },
    {
        id: 4,
        word: 'REACT',
        definition: 'JavaScript library for building user interfaces',
        startRow: 0,
        startCol: 5,
        direction: 'vertical',
    },
    {
        id: 5,
        word: 'API',
        definition: 'Interface that allows software to communicate',
        startRow: 0,
        startCol: 2,
        direction: 'vertical',
    },
    {
        id: 6,
        word: 'DATA',
        definition: 'Information processed or stored by a computer',
        startRow: 3,
        startCol: 7,
        direction: 'vertical',
    },
];

const GRID_SIZE = 10;

export default function CrosswordChallengePage() {
    const router = useRouter();
    const [currentWordIndex, setCurrentWordIndex] = React.useState(0);
    const [userAnswers, setUserAnswers] = React.useState<
        Record<number, string>
    >({});
    const [checkedWords, setCheckedWords] = React.useState<
        Record<number, boolean | null>
    >({});
    const [showResult, setShowResult] = React.useState(false);
    const [score, setScore] = React.useState(0);

    const currentWord = CROSSWORD_WORDS[currentWordIndex];
    const progress = ((currentWordIndex + 1) / CROSSWORD_WORDS.length) * 100;

    const generateGrid = () => {
        const grid: Array<Array<{ letter: string; wordId: number | null }>> =
            Array(GRID_SIZE)
                .fill(null)
                .map(() =>
                    Array(GRID_SIZE)
                        .fill(null)
                        .map(() => ({ letter: '', wordId: null })),
                );

        CROSSWORD_WORDS.forEach(word => {
            const letters = word.word.split('');
            letters.forEach((letter, index) => {
                if (word.direction === 'horizontal') {
                    grid[word.startRow][word.startCol + index] = {
                        letter: letter,
                        wordId: word.id,
                    };
                } else {
                    grid[word.startRow + index][word.startCol] = {
                        letter: letter,
                        wordId: word.id,
                    };
                }
            });
        });

        return grid;
    };

    const grid = React.useMemo(() => generateGrid(), []);

    const handleAnswerChange = (value: string) => {
        setUserAnswers({
            ...userAnswers,
            [currentWord.id]: value.toUpperCase(),
        });
    };

    const handleCheckAnswer = () => {
        const userAnswer = userAnswers[currentWord.id] || '';
        const isCorrect =
            userAnswer.toUpperCase() === currentWord.word.toUpperCase();

        setCheckedWords({
            ...checkedWords,
            [currentWord.id]: isCorrect,
        });

        if (isCorrect) {
            setScore(score + 1);
        }
    };

    const handleContinue = () => {
        if (currentWordIndex < CROSSWORD_WORDS.length - 1) {
            setCurrentWordIndex(currentWordIndex + 1);
        } else {
            setShowResult(true);
        }
    };

    const handleRestart = () => {
        setCurrentWordIndex(0);
        setUserAnswers({});
        setCheckedWords({});
        setScore(0);
        setShowResult(false);
    };

    const isWordChecked = checkedWords[currentWord.id] !== undefined;
    const isCurrentWordCorrect = checkedWords[currentWord.id] === true;

    if (showResult) {
        const percentage = Math.round((score / CROSSWORD_WORDS.length) * 100);
        const isPerfect = score === CROSSWORD_WORDS.length;

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
                                ? 'Amazing! You solved all the words!'
                                : 'Great effort! Keep practicing to improve.'}
                        </p>

                        <div className="mb-8 rounded-xl p-8">
                            <p className="mb-2 text-sm font-medium text-white/60">
                                Your Score
                            </p>
                            <p className="text-6xl font-bold text-[#e67320]">
                                {score}/{CROSSWORD_WORDS.length}
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
            <div className="container mx-auto max-w-5xl px-4">
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
                        <p className="text-sm text-white/60">Word</p>
                        <p className="text-lg font-bold text-white">
                            {currentWordIndex + 1} / {CROSSWORD_WORDS.length}
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

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Crossword Grid */}
                    <Card className="p-6">
                        <h2 className="mb-4 text-xl font-bold text-white">
                            Crossword Grid
                        </h2>
                        <div className="inline-block">
                            {grid.map((row, rowIndex) => (
                                <div key={rowIndex} className="flex">
                                    {row.map((cell, colIndex) => {
                                        const isPartOfWord =
                                            cell.wordId !== null;
                                        const isPartOfCurrentWord =
                                            cell.wordId === currentWord.id;
                                        const isCheckedWord =
                                            cell.wordId !== null &&
                                            checkedWords[cell.wordId] !==
                                                undefined;
                                        const isCorrectWord =
                                            cell.wordId !== null &&
                                            checkedWords[cell.wordId] === true;
                                        const isWrongWord =
                                            cell.wordId !== null &&
                                            checkedWords[cell.wordId] === false;

                                        const userAnswer = cell.wordId
                                            ? userAnswers[cell.wordId]
                                            : '';
                                        const letterIndex =
                                            CROSSWORD_WORDS.find(
                                                w => w.id === cell.wordId,
                                            )?.direction === 'horizontal'
                                                ? colIndex -
                                                  (CROSSWORD_WORDS.find(
                                                      w => w.id === cell.wordId,
                                                  )?.startCol || 0)
                                                : rowIndex -
                                                  (CROSSWORD_WORDS.find(
                                                      w => w.id === cell.wordId,
                                                  )?.startRow || 0);

                                        const displayLetter =
                                            userAnswer?.[letterIndex] || '';

                                        return (
                                            <div
                                                key={colIndex}
                                                className={`flex h-10 w-10 items-center justify-center border text-sm font-bold sm:h-12 sm:w-12 ${
                                                    isPartOfWord
                                                        ? isPartOfCurrentWord
                                                            ? 'border-[#e67320] bg-[#e67320]/20'
                                                            : isCorrectWord
                                                              ? 'border-green-500 bg-green-500/20'
                                                              : isWrongWord
                                                                ? 'border-red-500 bg-red-500/20'
                                                                : isCheckedWord
                                                                  ? 'border-white/20 bg-white/10'
                                                                  : 'border-white/20 bg-white/5'
                                                        : 'border-transparent bg-transparent'
                                                } ${
                                                    isPartOfWord
                                                        ? 'text-white'
                                                        : 'text-transparent'
                                                }`}
                                            >
                                                {isCheckedWord && isCorrectWord
                                                    ? cell.letter
                                                    : displayLetter}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>

                        {/* Legend */}
                        <div className="mt-4 space-y-2 text-xs text-white/60">
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 border border-[#e67320] bg-[#e67320]/20" />
                                <span>Current word</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 border border-green-500 bg-green-500/20" />
                                <span>Correct answer</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 border border-red-500 bg-red-500/20" />
                                <span>Wrong answer</span>
                            </div>
                        </div>
                    </Card>

                    {/* Definition and Input */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentWord.id}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Card className="p-6">
                                <div className="mb-4 flex items-start gap-3">
                                    <div className="rounded-lg bg-[#e67320]/20 p-2">
                                        <HelpCircle className="h-6 w-6 text-[#e67320]" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="mb-2 text-lg font-bold text-white">
                                            Definition #{currentWord.id}
                                        </h3>
                                        <p className="text-white/80">
                                            {currentWord.definition}
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="mb-2 block text-sm font-medium text-white/60">
                                        Your Answer ({currentWord.word.length}{' '}
                                        letters)
                                    </label>
                                    <Input
                                        value={
                                            userAnswers[currentWord.id] || ''
                                        }
                                        onChange={e =>
                                            handleAnswerChange(e.target.value)
                                        }
                                        disabled={isWordChecked}
                                        placeholder="Type your answer..."
                                        className={`bg-white/5 text-white placeholder:text-white/40 ${
                                            isWordChecked
                                                ? isCurrentWordCorrect
                                                    ? 'border-green-500'
                                                    : 'border-red-500'
                                                : 'border-white/20'
                                        }`}
                                        maxLength={currentWord.word.length}
                                    />
                                    <p className="mt-1 text-xs text-white/40">
                                        Direction:{' '}
                                        {currentWord.direction === 'horizontal'
                                            ? 'Horizontal →'
                                            : 'Vertical ↓'}
                                    </p>
                                </div>

                                {!isWordChecked ? (
                                    <Button
                                        onClick={handleCheckAnswer}
                                        disabled={
                                            !userAnswers[currentWord.id] ||
                                            userAnswers[currentWord.id]
                                                .length !==
                                                currentWord.word.length
                                        }
                                        className="w-full bg-[#e67320] text-[#0a0a0a] hover:bg-[#cf6318] disabled:opacity-50"
                                    >
                                        Check Answer
                                    </Button>
                                ) : (
                                    <div className="space-y-4">
                                        <motion.div
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className={`rounded-lg border p-4 ${
                                                isCurrentWordCorrect
                                                    ? 'border-green-500 bg-green-500/20'
                                                    : 'border-red-500 bg-red-500/20'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {isCurrentWordCorrect ? (
                                                    <Check className="h-8 w-8 text-green-500" />
                                                ) : (
                                                    <X className="h-8 w-8 text-red-500" />
                                                )}
                                                <div>
                                                    <p className="font-bold text-white">
                                                        {isCurrentWordCorrect
                                                            ? 'Correct!'
                                                            : 'Wrong Answer'}
                                                    </p>
                                                    {!isCurrentWordCorrect && (
                                                        <p className="text-sm text-white/60">
                                                            The correct answer
                                                            was:{' '}
                                                            <span className="font-bold text-white">
                                                                {
                                                                    currentWord.word
                                                                }
                                                            </span>
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>

                                        <Button
                                            onClick={handleContinue}
                                            className="w-full bg-[#e67320] text-[#0a0a0a] hover:bg-[#cf6318]"
                                        >
                                            {currentWordIndex <
                                            CROSSWORD_WORDS.length - 1
                                                ? 'Continue to Next Word'
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
                                            {currentWordIndex +
                                                (isWordChecked ? 1 : 0)}
                                        </span>
                                    </p>
                                </div>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
