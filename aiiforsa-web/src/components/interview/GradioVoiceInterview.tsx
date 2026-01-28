'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
    AlertCircle,
    CheckCircle,
    ExternalLink,
    FileText,
    History,
    Loader2,
    Mic,
    Phone,
    PhoneOff,
} from 'lucide-react';
import { useCallback, useState } from 'react';

interface GradioVoiceInterviewProps {
    cvData: string;
    jobDescription: string;
    onInterviewComplete?: (report: unknown) => void;
    onError?: (error: string) => void;
}

const GRADIO_API_URL =
    process.env.NEXT_PUBLIC_GRADIO_API_URL || 'http://localhost:7861';

type InterviewStatus =
    | 'idle'
    | 'setting_up'
    | 'ready'
    | 'in_progress'
    | 'completed'
    | 'error';

interface InterviewReport {
    section: string;
    score: string;
    strength: string;
    weaknesses: string;
    'general overview': string;
}

interface HistoryEntry {
    section: string;
    role: string;
    content: string;
}

/**
 * GradioVoiceInterview Component
 *
 * Integrates with the Gradio FastRTC voice interview by:
 * 1. Setting up the interview via Gradio API with CV and job description
 * 2. Embedding the Gradio WebRTC interface in an iframe
 * 3. Polling for completion and fetching report/history
 */
export default function GradioVoiceInterview({
    cvData,
    jobDescription,
    onInterviewComplete,
    onError,
}: GradioVoiceInterviewProps) {
    const [status, setStatus] = useState<InterviewStatus>('idle');
    const [statusMessage, setStatusMessage] = useState(
        'Ready to start interview',
    );
    const [error, setError] = useState<string | null>(null);
    const [showIframe, setShowIframe] = useState(false);
    const [report, setReport] = useState<InterviewReport[] | null>(null);
    const [history, setHistory] = useState<HistoryEntry[] | null>(null);
    const [progress, setProgress] = useState(0);

    // Helper function to call Gradio API
    const callGradioAPI = useCallback(
        async (endpoint: string, data: unknown[] = []): Promise<unknown> => {
            try {
                // Step 1: POST to initiate the call
                const postResponse = await fetch(
                    `${GRADIO_API_URL}/gradio_api/call/${endpoint}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ data }),
                    },
                );

                if (!postResponse.ok) {
                    throw new Error(
                        `Gradio API POST failed: ${postResponse.statusText}`,
                    );
                }

                const postResult = await postResponse.json();
                const eventId = postResult.event_id;

                if (!eventId) {
                    throw new Error('No event_id received from Gradio API');
                }

                // Step 2: GET results using event_id (SSE stream)
                const getResponse = await fetch(
                    `${GRADIO_API_URL}/gradio_api/call/${endpoint}/${eventId}`,
                );

                if (!getResponse.ok) {
                    throw new Error(
                        `Gradio API GET failed: ${getResponse.statusText}`,
                    );
                }

                const text = await getResponse.text();
                const lines = text.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data:')) {
                        const jsonStr = line.substring(5).trim();
                        if (jsonStr) {
                            return JSON.parse(jsonStr);
                        }
                    }
                }

                throw new Error('No data received from Gradio API');
            } catch (err) {
                console.error(`Gradio API error (${endpoint}):`, err);
                throw err;
            }
        },
        [],
    );

    // Setup interview via Gradio API
    const setupInterview = async () => {
        setStatus('setting_up');
        setStatusMessage('Setting up interview...');
        setError(null);
        setProgress(10);

        try {
            // Parse and validate CV data
            let cvJson = cvData;
            if (typeof cvData === 'string') {
                try {
                    // Verify it's valid JSON
                    JSON.parse(cvData);
                } catch {
                    // If not valid JSON, wrap it
                    cvJson = JSON.stringify({ rawData: cvData });
                }
            } else {
                cvJson = JSON.stringify(cvData);
            }

            // Parse and validate job description
            let jobJson = jobDescription;
            if (typeof jobDescription === 'string') {
                try {
                    JSON.parse(jobDescription);
                } catch {
                    jobJson = JSON.stringify({ description: jobDescription });
                }
            } else {
                jobJson = JSON.stringify(jobDescription);
            }

            setProgress(30);
            setStatusMessage(
                'Initializing voice interview with your CV and job details...',
            );

            // Call Gradio setup_voice_interview endpoint to setup interview
            const result = await callGradioAPI('setup_voice_interview', [
                cvJson,
                jobJson,
            ]);

            setProgress(60);

            // Check result
            const resultArray = result as string[];
            if (resultArray && resultArray[0]) {
                const message = resultArray[0];
                if (message.includes('✅')) {
                    setStatus('ready');
                    setStatusMessage(
                        'Interview ready! Click Start Interview to begin.',
                    );
                    setProgress(100);
                } else if (message.includes('❌')) {
                    throw new Error(message);
                } else {
                    setStatus('ready');
                    setStatusMessage(message);
                    setProgress(100);
                }
            } else {
                setStatus('ready');
                setStatusMessage('Interview initialized. Ready to start.');
                setProgress(100);
            }
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Failed to setup interview';
            setStatus('error');
            setError(message);
            setStatusMessage('Setup failed');
            onError?.(message);
        }
    };

    // Start the interview (show iframe)
    const startInterview = () => {
        setStatus('in_progress');
        setShowIframe(true);
        setStatusMessage(
            'Interview in progress. Speak clearly into your microphone.',
        );
    };

    // End interview and fetch results
    const endInterview = async () => {
        setShowIframe(false);
        setStatus('completed');
        setStatusMessage('Interview completed. Fetching results...');

        try {
            // Fetch report
            const reportResult = await callGradioAPI(
                'get_voice_interview_report',
            );
            const reportArray = reportResult as string[];
            if (reportArray && reportArray[0]) {
                const reportContent = reportArray[0];
                // Try to parse as JSON if possible
                try {
                    // The report might be in markdown format, try to extract JSON
                    const jsonMatch = reportContent.match(
                        /```json\s*([\s\S]*?)\s*```/,
                    );
                    if (jsonMatch) {
                        setReport(JSON.parse(jsonMatch[1]));
                    } else {
                        // Store as raw markdown
                        setReport([
                            {
                                section: 'Full Report',
                                score: 'N/A',
                                strength: reportContent,
                                weaknesses: '',
                                'general overview': '',
                            },
                        ]);
                    }
                } catch {
                    // Store as raw content
                    setReport([
                        {
                            section: 'Full Report',
                            score: 'N/A',
                            strength: reportContent,
                            weaknesses: '',
                            'general overview': '',
                        },
                    ]);
                }
            }

            // Fetch history
            const historyResult = await callGradioAPI(
                'get_voice_interview_history',
            );
            const historyArray = historyResult as string[];
            if (historyArray && historyArray[0]) {
                const historyContent = historyArray[0];
                try {
                    const parsedHistory = JSON.parse(historyContent);
                    setHistory(parsedHistory);
                } catch {
                    console.error('Failed to parse history');
                }
            }

            setStatusMessage('Interview completed! Review your results below.');
            onInterviewComplete?.({ report, history });
        } catch (err) {
            console.error('Error fetching results:', err);
            setStatusMessage(
                'Interview completed. Some results may not be available.',
            );
        }
    };

    // Render status badge
    const getStatusBadge = () => {
        switch (status) {
            case 'idle':
                return <Badge variant="outline">Not Started</Badge>;
            case 'setting_up':
                return <Badge className="bg-yellow-500">Setting Up</Badge>;
            case 'ready':
                return <Badge className="bg-green-500">Ready</Badge>;
            case 'in_progress':
                return (
                    <Badge className="bg-blue-500 animate-pulse">
                        In Progress
                    </Badge>
                );
            case 'completed':
                return <Badge className="bg-green-600">Completed</Badge>;
            case 'error':
                return <Badge variant="destructive">Error</Badge>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-white">
                            <Mic className="h-5 w-5 text-[#e67320]" />
                            Voice Interview
                        </CardTitle>
                        {getStatusBadge()}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Status Message */}
                    <div className="flex items-center gap-2 text-sm text-zinc-300">
                        {status === 'setting_up' && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        {status === 'ready' && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        {status === 'error' && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        {status === 'in_progress' && (
                            <Phone className="h-4 w-4 text-blue-500 animate-pulse" />
                        )}
                        <span>{statusMessage}</span>
                    </div>

                    {/* Progress Bar */}
                    {status === 'setting_up' && (
                        <Progress value={progress} className="h-2" />
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                        {status === 'idle' && (
                            <Button
                                onClick={setupInterview}
                                className="bg-[#e67320] hover:bg-[#cf6318]"
                            >
                                <Mic className="mr-2 h-4 w-4" />
                                Setup Interview
                            </Button>
                        )}

                        {status === 'ready' && (
                            <Button
                                onClick={startInterview}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Phone className="mr-2 h-4 w-4" />
                                Start Interview
                            </Button>
                        )}

                        {status === 'in_progress' && (
                            <Button
                                onClick={endInterview}
                                variant="destructive"
                            >
                                <PhoneOff className="mr-2 h-4 w-4" />
                                End Interview
                            </Button>
                        )}

                        {status === 'error' && (
                            <Button
                                onClick={() => {
                                    setStatus('idle');
                                    setError(null);
                                }}
                                variant="outline"
                            >
                                Try Again
                            </Button>
                        )}

                        {/* Open in Gradio link */}
                        <Button
                            variant="outline"
                            onClick={() =>
                                window.open(
                                    `${GRADIO_API_URL}/?__theme=dark`,
                                    '_blank',
                                )
                            }
                            className="border-zinc-600"
                        >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open in Gradio
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Gradio Iframe */}
            {showIframe && (
                <Card className="bg-zinc-900 border-zinc-700 overflow-hidden">
                    <CardContent className="p-0">
                        <div className="relative">
                            <div className="absolute top-4 right-4 z-10">
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={endInterview}
                                >
                                    <PhoneOff className="mr-2 h-4 w-4" />
                                    End Interview
                                </Button>
                            </div>
                            <iframe
                                src={`${GRADIO_API_URL}/?__theme=dark`}
                                className="w-full h-[700px] border-0"
                                allow="microphone; camera; autoplay"
                                title="Voice Interview"
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Results Section */}
            {status === 'completed' && (
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Report Card */}
                    <Card className="bg-zinc-900 border-zinc-700">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white text-lg">
                                <FileText className="h-5 w-5 text-[#e67320]" />
                                Interview Report
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {report ? (
                                <div className="space-y-4">
                                    {report.map((section, idx) => (
                                        <div
                                            key={idx}
                                            className="p-4 bg-zinc-800/50 rounded-lg"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold text-white">
                                                    {section.section}
                                                </h4>
                                                <Badge variant="outline">
                                                    {section.score}
                                                </Badge>
                                            </div>
                                            {section.strength && (
                                                <div className="mb-2">
                                                    <p className="text-xs text-zinc-400 mb-1">
                                                        Strengths
                                                    </p>
                                                    <p className="text-sm text-zinc-300">
                                                        {section.strength}
                                                    </p>
                                                </div>
                                            )}
                                            {section.weaknesses && (
                                                <div className="mb-2">
                                                    <p className="text-xs text-zinc-400 mb-1">
                                                        Areas for Improvement
                                                    </p>
                                                    <p className="text-sm text-zinc-300">
                                                        {section.weaknesses}
                                                    </p>
                                                </div>
                                            )}
                                            {section['general overview'] && (
                                                <div>
                                                    <p className="text-xs text-zinc-400 mb-1">
                                                        Overview
                                                    </p>
                                                    <p className="text-sm text-zinc-300">
                                                        {
                                                            section[
                                                                'general overview'
                                                            ]
                                                        }
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-zinc-400 text-sm">
                                    No report available yet.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* History Card */}
                    <Card className="bg-zinc-900 border-zinc-700">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white text-lg">
                                <History className="h-5 w-5 text-[#e67320]" />
                                Conversation History
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {history && history.length > 0 ? (
                                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                    {history.map((entry, idx) => (
                                        <div
                                            key={idx}
                                            className={cn(
                                                'p-3 rounded-lg',
                                                entry.role.includes('User')
                                                    ? 'bg-blue-500/10 border border-blue-500/30'
                                                    : 'bg-zinc-800/50',
                                            )}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {entry.section}
                                                </Badge>
                                                <span className="text-xs text-zinc-400">
                                                    {entry.role}
                                                </span>
                                            </div>
                                            <p className="text-sm text-zinc-300">
                                                {entry.content}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-zinc-400 text-sm">
                                    No conversation history available.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Instructions */}
            {status === 'idle' && (
                <Card className="bg-zinc-800/50 border-zinc-700">
                    <CardContent className="pt-6">
                        <h4 className="font-semibold text-white mb-3">
                            How it works:
                        </h4>
                        <ol className="space-y-2 text-sm text-zinc-300">
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-[#e67320]">
                                    1.
                                </span>
                                Click &quot;Setup Interview&quot; to initialize
                                with your CV and job details
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-[#e67320]">
                                    2.
                                </span>
                                Click &quot;Start Interview&quot; to begin the
                                voice interview
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-[#e67320]">
                                    3.
                                </span>
                                Allow microphone access when prompted
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-[#e67320]">
                                    4.
                                </span>
                                Speak clearly and wait for the AI to respond
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="font-bold text-[#e67320]">
                                    5.
                                </span>
                                Click &quot;End Interview&quot; when finished to
                                see your results
                            </li>
                        </ol>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
