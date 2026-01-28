'use client';

import {
    getVoiceInterviewHistory,
    getVoiceInterviewHistoryGradio,
    getVoiceInterviewReport,
    getVoiceInterviewReportGradio,
    pingGradioServer,
} from '@/actions/interview-actions';
import InterviewSteps from '@/components/interview/InterviewSteps';
import { AlertCircle, Brain, Check, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function InterviewAnalysisPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [error, setError] = useState('');

    const steps = [
        'Transcribing responses...',
        'Analyzing content and context...',
        'Evaluating performance metrics...',
        'Generating feedback...',
    ];

    const mockReport = {
        sessionId: 'mock-session',
        evaluation: [
            {
                section: 'Introduction',
                score: 7,
                strength: 'Good communication skills',
                weaknesses: 'Could be more confident',
                general_overview: 'Solid introduction with clear responses',
            },
        ],
        overallScore: 7,
        status: 'completed',
        generatedAt: new Date().toISOString(),
    };

    const mockHistory = {
        sessionId: 'mock-session',
        history: [
            {
                section: 'Introduction',
                role: 'interviewer',
                content: 'Tell me about yourself.',
            },
            {
                section: 'Introduction',
                role: 'candidate',
                content: 'I am a software developer with 3 years of experience.',
            },
        ],
        totalExchanges: 2,
    };

    useEffect(() => {
        async function analyzeInterview() {
            // Simulate step progression
            for (let i = 0; i < steps.length; i++) {
                setCurrentStep(i);
                await new Promise(resolve => setTimeout(resolve, 1200));
            }

            try {
                // Check if we have a report from the native voice interview
                const storedReport = sessionStorage.getItem('interviewReport');

                if (storedReport) {
                    // Use the report from the native interview
                    const report = JSON.parse(storedReport);
                    sessionStorage.setItem(
                        'voiceInterviewReport',
                        JSON.stringify(report),
                    );
                    sessionStorage.setItem(
                        'voiceInterviewHistory',
                        JSON.stringify({
                            sessionId: report.sessionId || 'native-session',
                            history: report.history || [],
                            totalExchanges: report.history?.length || 0,
                        }),
                    );
                    return;
                }

                // Fallback: Check for existing stored data from previous sessions
                const storedSessionId = sessionStorage.getItem(
                    'voiceInterviewSessionId',
                );
                const cleanedSessionId =
                    storedSessionId &&
                    storedSessionId !== 'undefined' &&
                    storedSessionId !== 'null'
                        ? storedSessionId
                        : undefined;

                // Check if Gradio server is available - prefer Gradio API over NestJS
                const gradioStatus = await pingGradioServer();

                if (gradioStatus.success) {
                    // Use Gradio API for report and history
                    console.log('Using Gradio API for interview analysis...');

                    const gradioReportResult =
                        await getVoiceInterviewReportGradio();

                    if (gradioReportResult.success && gradioReportResult.data) {
                        // Convert Gradio report format to expected format
                        const gradioReport = {
                            sessionId: cleanedSessionId || 'gradio-session',
                            evaluation: gradioReportResult.data.evaluation.map(
                                e => ({
                                    section: e.section,
                                    score: parseInt(e.score.split('/')[0]) || 0,
                                    strength: e.strength,
                                    weaknesses: e.weaknesses,
                                    general_overview: e.general_overview,
                                }),
                            ),
                            overallScore:
                                gradioReportResult.data.evaluation.length > 0
                                    ? Math.round(
                                          gradioReportResult.data.evaluation.reduce(
                                              (sum, e) =>
                                                  sum +
                                                  (parseInt(
                                                      e.score.split('/')[0],
                                                  ) || 0),
                                              0,
                                          ) /
                                              gradioReportResult.data.evaluation
                                                  .length,
                                      )
                                    : 0,
                            markdown: gradioReportResult.data.markdown,
                        };
                        sessionStorage.setItem(
                            'voiceInterviewReport',
                            JSON.stringify(gradioReport),
                        );
                    } else {
                        // Fallback to NestJS API
                        const reportResult =
                            await getVoiceInterviewReport(cleanedSessionId);
                        if (reportResult.success && reportResult.data) {
                            sessionStorage.setItem(
                                'voiceInterviewReport',
                                JSON.stringify(reportResult.data),
                            );
                        } else {
                            sessionStorage.setItem(
                                'voiceInterviewReport',
                                JSON.stringify(mockReport),
                            );
                        }
                    }

                    const gradioHistoryResult =
                        await getVoiceInterviewHistoryGradio();

                    if (
                        gradioHistoryResult.success &&
                        gradioHistoryResult.data
                    ) {
                        // Convert Gradio history format to expected format
                        const gradioHistory = {
                            sessionId: cleanedSessionId || 'gradio-session',
                            history: gradioHistoryResult.data.map(h => ({
                                section: h.section,
                                role:
                                    h.role === 'User said'
                                        ? 'candidate'
                                        : 'interviewer',
                                content: h.content,
                            })),
                            totalExchanges: gradioHistoryResult.data.length,
                        };
                        sessionStorage.setItem(
                            'voiceInterviewHistory',
                            JSON.stringify(gradioHistory),
                        );
                    } else {
                        // Fallback to NestJS API
                        const historyResult =
                            await getVoiceInterviewHistory(cleanedSessionId);
                        if (historyResult.success && historyResult.data) {
                            sessionStorage.setItem(
                                'voiceInterviewHistory',
                                JSON.stringify(historyResult.data),
                            );
                        } else {
                            sessionStorage.setItem(
                                'voiceInterviewHistory',
                                JSON.stringify(mockHistory),
                            );
                        }
                    }
                } else {
                    // Gradio not available, use NestJS API
                    console.log('Gradio not available, using NestJS API...');

                    const reportResult =
                        await getVoiceInterviewReport(cleanedSessionId);

                    if (reportResult.success && reportResult.data) {
                        sessionStorage.setItem(
                            'voiceInterviewReport',
                            JSON.stringify(reportResult.data),
                        );
                    } else {
                        sessionStorage.setItem(
                            'voiceInterviewReport',
                            JSON.stringify(mockReport),
                        );
                    }

                    const historyResult =
                        await getVoiceInterviewHistory(cleanedSessionId);

                    if (historyResult.success && historyResult.data) {
                        sessionStorage.setItem(
                            'voiceInterviewHistory',
                            JSON.stringify(historyResult.data),
                        );
                    } else {
                        sessionStorage.setItem(
                            'voiceInterviewHistory',
                            JSON.stringify(mockHistory),
                        );
                    }
                }
            } catch (err) {
                console.error('Error analyzing interview:', err);
                // Use mock data on error
                sessionStorage.setItem(
                    'voiceInterviewReport',
                    JSON.stringify(mockReport),
                );
                sessionStorage.setItem(
                    'voiceInterviewHistory',
                    JSON.stringify(mockHistory),
                );
            }

            // Navigate to results
            router.push('/interview/results?view=summary');
        }

        analyzeInterview();
    }, [router]);

    const progress = Math.round(((currentStep + 1) / steps.length) * 100);

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto">
                <InterviewSteps active={3} />

                <div className="mt-6 p-8 bg-background/40 border border-white/10 rounded-xl shadow-md">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-6">
                            <Brain className="text-white" />
                        </div>

                        <h3 className="text-lg text-white font-semibold mb-2">
                            AI is analyzing your responses...
                        </h3>
                        <p className="text-sm text-gray-300 mb-6">
                            Please wait while we evaluate your interview
                            performance
                        </p>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-sm">{error}</span>
                            </div>
                        )}

                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-6">
                            <div
                                className="h-2 bg-accent transition-all duration-500"
                                style={{
                                    width: `${progress}%`,
                                }}
                            />
                        </div>

                        <div className="space-y-3 text-left">
                            {steps.map((s, i) => {
                                const isActive = i === currentStep;
                                const isComplete = i < currentStep;
                                let Icon = Check;
                                if (i === 1) Icon = Brain;
                                if (i === 2) Icon = LayoutDashboard;

                                return (
                                    <div
                                        key={s}
                                        className={
                                            isActive
                                                ? 'py-3 px-4 rounded-md bg-accent/10 border border-accent/30 text-accent flex items-center gap-3'
                                                : isComplete
                                                  ? 'py-3 px-4 rounded-md bg-green-500/10 text-green-400 flex items-center gap-3'
                                                  : 'py-3 px-4 rounded-md bg-white/5 text-gray-300 flex items-center gap-3'
                                        }
                                    >
                                        <div
                                            className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                                isComplete
                                                    ? 'bg-green-500/20'
                                                    : 'bg-white/5'
                                            }`}
                                        >
                                            {isComplete ? (
                                                <Check className="w-4 h-4 text-green-400" />
                                            ) : (
                                                <Icon
                                                    className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`}
                                                />
                                            )}
                                        </div>
                                        <div>{s}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
