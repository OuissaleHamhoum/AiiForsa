'use client';

import InterviewSteps from '@/components/interview/InterviewSteps';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Repeat } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function CircularProgress({ score }: { score: number }) {
    const radius = 48;
    const stroke = 8;
    const normalizedRadius = radius - stroke / 2;
    const circumference = 2 * Math.PI * normalizedRadius;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    return (
        <svg
            width="96"
            height="96"
            viewBox={`0 0 ${radius * 2} ${radius * 2}`}
            className="block"
        >
            <defs>
                <linearGradient id="g1" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stopColor="#f97316" />
                    <stop offset="100%" stopColor="#fb923c" />
                </linearGradient>
            </defs>

            {/* background ring */}
            <circle
                stroke="rgba(255,255,255,0.06)"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
            />

            {/* foreground progress */}
            <circle
                stroke="url(#g1)"
                fill="transparent"
                strokeWidth={stroke}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 800ms ease' }}
                transform={`rotate(-90 ${radius} ${radius})`}
            />

            {/* center label */}
            <g>
                <text
                    x="50%"
                    y="50%"
                    dy="6"
                    textAnchor="middle"
                    className="text-3xl font-semibold"
                    style={{ fontSize: '20px', fill: 'white' }}
                >
                    {score}%
                </text>
            </g>
        </svg>
    );
}

function SegmentedToggle({
    value,
    onChange,
    leftLabel,
    rightLabel,
}: {
    value: 'summary' | 'per-question';
    onChange: (v: 'summary' | 'per-question') => void;
    leftLabel: string;
    rightLabel: string;
}) {
    return (
        <div className="inline-flex items-center rounded-full bg-white/5 p-1">
            <button
                type="button"
                aria-pressed={value === 'summary'}
                onClick={() => onChange('summary')}
                className={`px-4 py-1 rounded-full text-sm font-medium transition-colors ${
                    value === 'summary'
                        ? 'bg-accent text-white'
                        : 'text-gray-400'
                }`}
            >
                {leftLabel}
            </button>

            <button
                type="button"
                aria-pressed={value === 'per-question'}
                onClick={() => onChange('per-question')}
                className={`ml-1 px-4 py-1 rounded-full text-sm font-medium transition-colors ${
                    value === 'per-question'
                        ? 'bg-accent text-white'
                        : 'text-gray-400'
                }`}
            >
                {rightLabel}
            </button>
        </div>
    );
}

function InterviewResultsContent() {
    const [view, setView] = useState<'summary' | 'per-question'>('summary');
    const [evaluationReport, setEvaluationReport] = useState<string>('');
    const [sessionExport, setSessionExport] = useState<string>('');
    const [chatHistory, setChatHistory] = useState<any[]>([]);
    const searchParams = useSearchParams();

    // Load data from sessionStorage on mount
    useEffect(() => {
        const q = searchParams.get('view');
        if (q === 'per-question') setView('per-question');

        // Load evaluation report
        const storedReport = sessionStorage.getItem('evaluationReport');
        if (storedReport) {
            setEvaluationReport(storedReport);
        }

        // Load session export
        const storedExport = sessionStorage.getItem('sessionExport');
        if (storedExport) {
            setSessionExport(storedExport);
        }

        // Load chat history
        const storedChat = sessionStorage.getItem('interviewChat');
        if (storedChat) {
            try {
                setChatHistory(JSON.parse(storedChat));
            } catch {
                console.error('Failed to parse chat history');
            }
        }
    }, [searchParams]);

    // Parse evaluation report if it's JSON, otherwise use defaults
    let parsedReport: any = null;
    try {
        if (evaluationReport && evaluationReport.startsWith('{')) {
            parsedReport = JSON.parse(evaluationReport);
        }
    } catch {
        // Report is markdown or invalid JSON
    }

    // Extract scores from parsed report or use defaults
    const overallScore =
        parsedReport?.overall_score || parsedReport?.overallScore || 82;
    const breakdown = parsedReport?.breakdown ||
        parsedReport?.categories || [
            { label: 'Technical Knowledge', value: 88 },
            { label: 'Communication', value: 85 },
            { label: 'Problem Solving', value: 82 },
            { label: 'Leadership & Teamwork', value: 90 },
        ];

    // Convert chat history to questions for per-question view
    const questions = chatHistory
        .filter((msg: any) => msg.role === 'assistant')
        .map((msg: any, idx: number) => {
            const userResponse = chatHistory.find(
                (m: any, i: number) =>
                    m.role === 'user' && i > chatHistory.indexOf(msg),
            );
            return {
                id: idx + 1,
                title: `Question ${idx + 1}`,
                prompt: msg.content,
                response: userResponse?.content || 'No response',
                score:
                    parsedReport?.question_scores?.[idx] ||
                    80 + Math.floor(Math.random() * 15),
                feedback:
                    parsedReport?.question_feedback?.[idx] ||
                    'Good response demonstrating relevant skills and knowledge.',
                strengths: parsedReport?.question_strengths?.[idx] || [
                    'Clear communication',
                    'Relevant examples',
                ],
                areasToImprove: parsedReport?.question_improvements?.[idx] || [
                    'More specific details',
                ],
            };
        })
        .slice(0, 10); // Limit to 10 questions

    const highlights = parsedReport?.highlights || [
        {
            title: 'Strong Leadership Skills',
            body: 'Demonstrated excellent conflict resolution and team collaboration',
            tone: 'green',
        },
        {
            title: 'Technical Expertise',
            body: 'Clear understanding of debugging and system architecture',
            tone: 'teal',
        },
        {
            title: 'Continuous Learner',
            body: 'Shows commitment to professional development',
            tone: 'amber',
        },
    ];

    function handleDownloadReport() {
        // Create downloadable report
        const reportContent =
            evaluationReport || 'No evaluation report available';
        const blob = new Blob([reportContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'interview-report.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function handleRedoInterview() {
        // Clear session data and go back to setup
        sessionStorage.removeItem('interviewChat');
        sessionStorage.removeItem('interviewStatus');
        sessionStorage.removeItem('evaluationReport');
        sessionStorage.removeItem('sessionExport');
        window.location.href = '/interview';
    }

    return (
        <div className="min-h-screen p-8 flex items-center justify-center">
            <div className="max-w-6xl w-full">
                <InterviewSteps active={4} />

                {/* The analysis overlay is shown on the dedicated /interview/analysis
                    page which redirects back to results after a short pause. */}

                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h1 className="text-2xl text-white font-semibold">
                            Interview Results
                        </h1>
                        <p className="text-sm text-gray-400">
                            Complete analysis of your interview performance
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            className="flex items-center gap-2"
                            onClick={handleRedoInterview}
                        >
                            <Repeat className="w-4 h-4" />
                            Redo Interview
                        </Button>
                        <Button
                            className="bg-accent flex items-center gap-2"
                            onClick={handleDownloadReport}
                        >
                            <Download className="w-4 h-4" />
                            Download Report
                        </Button>
                    </div>
                </div>

                {/* Toggle placed under title and before analysis/percentage */}
                <div className="flex items-center justify-end gap-2 mb-6">
                    <SegmentedToggle
                        value={view}
                        onChange={v => {
                            // Immediately switch the view on the Results page.
                            // The AI analysis waiting period is only used on the
                            // dedicated /interview/analysis page (which will
                            // redirect back to results after 5s). Clicking the
                            // toggle should not introduce any waiting.
                            setView(v);
                        }}
                        leftLabel="Total Score & Feedback"
                        rightLabel="Each Question Feedback"
                    />
                </div>

                {view === 'summary' && (
                    <div className="mb-6">
                        <div className="flex gap-6">
                            <div className="flex-1">
                                <div className="p-6 bg-background/40 border border-white/10 rounded-xl">
                                    <div className="flex items-center gap-8">
                                        {/* render only the circular progress without the square background */}
                                        <div className="flex items-center justify-center">
                                            <CircularProgress
                                                score={overallScore}
                                            />
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="text-lg text-white font-semibold mb-2">
                                                Overall Performance
                                            </h3>
                                            <div className="mb-3">
                                                <span className="inline-block bg-emerald-700/20 text-emerald-300 text-xs px-2 py-1 rounded">
                                                    Excellent
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div>
                                                    {breakdown.map(
                                                        (b: {
                                                            label: string;
                                                            value: number;
                                                        }) => (
                                                            <div
                                                                key={b.label}
                                                                className="mb-4"
                                                            >
                                                                <div className="flex justify-between text-sm text-gray-300 mb-1">
                                                                    <div>
                                                                        {
                                                                            b.label
                                                                        }
                                                                    </div>
                                                                    <div>
                                                                        {
                                                                            b.value
                                                                        }
                                                                        %
                                                                    </div>
                                                                </div>

                                                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                                                    <div
                                                                        className="h-2 bg-accent"
                                                                        style={{
                                                                            width: `${b.value}%`,
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>

                                                <div>
                                                    <h4 className="text-sm text-gray-300 mb-3">
                                                        Key Highlights
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {highlights.map(
                                                            (h: {
                                                                title: string;
                                                                body: string;
                                                            }) => (
                                                                <div
                                                                    key={
                                                                        h.title
                                                                    }
                                                                    className="p-3 rounded-md bg-white/5"
                                                                >
                                                                    <div className="text-sm text-accent font-semibold mb-1">
                                                                        {
                                                                            h.title
                                                                        }
                                                                    </div>
                                                                    <div className="text-sm text-gray-300">
                                                                        {h.body}
                                                                    </div>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/** summary / per-question toggle area moved above; render whichever view here */}
                {view === 'summary' ? (
                    <Card>
                        <CardContent>
                            <h3 className="text-lg text-white font-semibold mb-3">
                                Overall Feedback
                            </h3>
                            <p className="text-sm text-gray-300 mb-3">
                                You demonstrated strong technical competency and
                                excellent communication skills throughout the
                                interview. The examples you provided were
                                relevant and well-articulated, particularly when
                                discussing team dynamics and problem-solving
                                approaches.
                            </p>

                            <p className="text-sm text-gray-300">
                                Areas for improvement include providing more
                                quantitative metrics when discussing project
                                outcomes and elaborating on documentation
                                practices. Overall, this was a strong
                                performance that reflects well-rounded
                                professional capabilities.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent>
                            <h3 className="text-lg text-white font-semibold mb-3">
                                Each Question Feedback
                            </h3>

                            <div className="space-y-6">
                                {questions.map(q => (
                                    <div
                                        key={q.id}
                                        className="p-6 rounded-xl bg-white/5 border border-white/5"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-xs text-gray-300">
                                                Question {q.id}
                                            </div>

                                            <div className="text-sm text-emerald-300 font-semibold">
                                                Score: {q.score}/100
                                            </div>
                                        </div>

                                        <div className="text-sm text-gray-200 mb-3">
                                            {q.prompt}
                                        </div>

                                        <div className="w-full h-2 bg-white/10 rounded-full mb-4">
                                            <div
                                                className="h-2 bg-gradient-to-r from-accent to-accent/70"
                                                style={{ width: `${q.score}%` }}
                                            />
                                        </div>

                                        <div className="text-sm text-gray-300 mb-2 font-semibold">
                                            Feedback
                                        </div>

                                        <div className="text-sm text-gray-300 mb-4">
                                            {q.feedback}
                                        </div>

                                        <div className="flex items-start justify-between gap-6">
                                            <div className="flex-1">
                                                <div className="text-sm text-gray-300 mb-2 font-semibold">
                                                    Strengths
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {q.strengths.map(
                                                        (s: string) => (
                                                            <span
                                                                key={s}
                                                                className="text-xs inline-block bg-emerald-700/20 text-emerald-300 px-2 py-1 rounded-full"
                                                            >
                                                                {s}
                                                            </span>
                                                        ),
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                <div className="text-sm text-gray-300 mb-2 font-semibold">
                                                    Areas to Improve
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {q.areasToImprove.map(
                                                        (a: string) => (
                                                            <span
                                                                key={a}
                                                                className="text-xs inline-block bg-amber-700/20 text-amber-300 px-2 py-1 rounded-full"
                                                            >
                                                                {a}
                                                            </span>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

export default function InterviewResultsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <InterviewResultsContent />
        </Suspense>
    );
}
