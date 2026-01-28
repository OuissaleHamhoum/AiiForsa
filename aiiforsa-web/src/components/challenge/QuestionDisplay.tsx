'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import type { Question } from '@/types/challenge.types';
import { CheckCircle2 } from 'lucide-react';
import * as React from 'react';

export interface QuestionDisplayProps {
    question: Question;
    onSubmit: (answer: string | string[]) => void;
    disabled?: boolean;
}

export function QuestionDisplay({
    question,
    onSubmit,
    disabled = false,
}: QuestionDisplayProps) {
    const [answer, setAnswer] = React.useState<string | string[]>('');
    const [matchedPairs, setMatchedPairs] = React.useState<
        Array<{ left: string; right: string }>
    >([]);
    const [selectedLeft, setSelectedLeft] = React.useState<string | null>(null);

    const canSubmit = React.useMemo(() => {
        if (question.type === 'text') {
            return typeof answer === 'string' && answer.trim().length >= 50;
        }
        if (question.type === 'mcq') {
            return Array.isArray(answer)
                ? answer.length > 0
                : answer.length > 0;
        }
        if (question.type === 'match') {
            return matchedPairs.length === (question.pairs?.length || 0);
        }
        return false;
    }, [answer, matchedPairs, question]);

    const handleSubmit = () => {
        if (!canSubmit) return;

        if (question.type === 'match') {
            const pairStrings = matchedPairs.map(p => `${p.left}:${p.right}`);
            onSubmit(pairStrings);
        } else {
            onSubmit(answer);
        }
    };

    const handleMatch = (rightItem: string) => {
        if (!selectedLeft) return;

        const newPair = { left: selectedLeft, right: rightItem };
        setMatchedPairs([...matchedPairs, newPair]);
        setSelectedLeft(null);
    };

    // MCQ rendering
    if (question.type === 'mcq' && question.options) {
        const isMultiSelect = question.multiSelect;

        return (
            <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white">
                    {question.question}
                </h3>

                {isMultiSelect ? (
                    <div className="space-y-3">
                        {question.options.map((option, idx) => {
                            const selected = Array.isArray(answer)
                                ? answer.includes(option)
                                : false;
                            return (
                                <div
                                    key={idx}
                                    className="flex items-center space-x-3 rounded-lg border border-white/10 bg-white/5 p-4 hover:border-[#e67320]/30"
                                >
                                    <Checkbox
                                        id={`option-${idx}`}
                                        checked={selected}
                                        onCheckedChange={checked => {
                                            const current = Array.isArray(
                                                answer,
                                            )
                                                ? answer
                                                : [];
                                            if (checked) {
                                                setAnswer([...current, option]);
                                            } else {
                                                setAnswer(
                                                    current.filter(
                                                        a => a !== option,
                                                    ),
                                                );
                                            }
                                        }}
                                        disabled={disabled}
                                    />
                                    <Label
                                        htmlFor={`option-${idx}`}
                                        className="flex-1 cursor-pointer text-white"
                                    >
                                        {option}
                                    </Label>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <RadioGroup
                        value={typeof answer === 'string' ? answer : ''}
                        onValueChange={setAnswer}
                        disabled={disabled}
                    >
                        <div className="space-y-3">
                            {question.options.map((option, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center space-x-3 rounded-lg border border-white/10 bg-white/5 p-4 hover:border-[#e67320]/30"
                                >
                                    <RadioGroupItem
                                        value={option}
                                        id={`option-${idx}`}
                                    />
                                    <Label
                                        htmlFor={`option-${idx}`}
                                        className="flex-1 cursor-pointer text-white"
                                    >
                                        {option}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </RadioGroup>
                )}

                <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit || disabled}
                    className="w-full bg-[#e67320] text-[#0a0a0a] hover:bg-[#cf6318]"
                    aria-label="Submit answer"
                >
                    Submit Answer
                </Button>
            </div>
        );
    }

    // Text rendering
    if (question.type === 'text') {
        const charCount = typeof answer === 'string' ? answer.length : 0;

        return (
            <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white">
                    {question.question}
                </h3>

                <div className="space-y-2">
                    <Textarea
                        value={typeof answer === 'string' ? answer : ''}
                        onChange={e => setAnswer(e.target.value)}
                        placeholder="Type your pitch here... (minimum 50 characters)"
                        rows={8}
                        disabled={disabled}
                        className="bg-white/5 text-white border-white/10 placeholder:text-white/40"
                        aria-label="Your answer"
                    />
                    <p className="text-sm text-white/60">
                        {charCount} / 50 characters minimum
                    </p>
                </div>

                <Button
                    onClick={handleSubmit}
                    disabled={!canSubmit || disabled}
                    className="w-full bg-[#e67320] text-[#0a0a0a] hover:bg-[#cf6318]"
                    aria-label="Submit answer"
                >
                    Submit Answer
                </Button>
            </div>
        );
    }

    // Match rendering
    if (question.type === 'match' && question.pairs) {
        const leftItems = question.pairs.map(p => p.left);
        const rightItems = question.pairs.map(p => p.right);
        const matchedLefts = matchedPairs.map(p => p.left);
        const matchedRights = matchedPairs.map(p => p.right);

        return (
            <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white">
                    {question.question}
                </h3>
                <p className="text-sm text-white/60">
                    Click an item on the left, then click its match on the right
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                    {/* Left column */}
                    <div className="space-y-2">
                        {leftItems.map((item, idx) => {
                            const isMatched = matchedLefts.includes(item);
                            const isSelected = selectedLeft === item;

                            return (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        if (!isMatched && !disabled) {
                                            setSelectedLeft(
                                                isSelected ? null : item,
                                            );
                                        }
                                    }}
                                    disabled={isMatched || disabled}
                                    className={`w-full rounded-lg border p-4 text-left transition-all ${
                                        isMatched
                                            ? 'border-green-500/50 bg-green-500/10 text-white/60'
                                            : isSelected
                                              ? 'border-[#e67320] bg-[#e67320]/20 text-white'
                                              : 'border-white/10 bg-white/5 text-white hover:border-[#e67320]/30'
                                    }`}
                                    aria-label={`Select ${item}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{item}</span>
                                        {isMatched && (
                                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Right column */}
                    <div className="space-y-2">
                        {rightItems.map((item, idx) => {
                            const isMatched = matchedRights.includes(item);

                            return (
                                <button
                                    key={idx}
                                    onClick={() => {
                                        if (!isMatched && !disabled) {
                                            handleMatch(item);
                                        }
                                    }}
                                    disabled={
                                        isMatched || !selectedLeft || disabled
                                    }
                                    className={`w-full rounded-lg border p-4 text-left transition-all ${
                                        isMatched
                                            ? 'border-green-500/50 bg-green-500/10 text-white/60'
                                            : selectedLeft
                                              ? 'border-white/10 bg-white/5 text-white hover:border-[#e67320]/30'
                                              : 'border-white/10 bg-white/5 text-white/40'
                                    }`}
                                    aria-label={`Match with ${item}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{item}</span>
                                        {isMatched && (
                                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {matchedPairs.length === question.pairs.length && (
                    <Button
                        onClick={handleSubmit}
                        disabled={disabled}
                        className="w-full bg-[#e67320] text-[#0a0a0a] hover:bg-[#cf6318]"
                        aria-label="Submit answer"
                    >
                        Submit Answer
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="text-white">
            <p>Unknown question type</p>
        </div>
    );
}

export default QuestionDisplay;
