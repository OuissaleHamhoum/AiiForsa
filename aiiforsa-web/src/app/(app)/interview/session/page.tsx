'use client';

import { getUserCV } from '@/actions/job-actions';
import GradioVoiceInterview from '@/components/interview/GradioVoiceInterview';
import InterviewSteps from '@/components/interview/InterviewSteps';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { AlertCircle, CheckCircle2, Loader2, Mic, Volume2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function InterviewSessionPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();

    // Voice interview state
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [cvData, setCvData] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [elapsedTime, setElapsedTime] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Interview config
    const [config, setConfig] = useState<{
        jobTitle: string;
        jobDescription: string;
        jobRequirements: string;
    } | null>(null);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, []);

    // Load interview data from sessionStorage and API
    useEffect(() => {
        async function initializeInterview() {
            if (!isAuthenticated) {
                setError('Please log in to continue with the interview.');
                setIsLoading(false);
                return;
            }

            if (!user?.id) {
                setError('User session not found. Please log in again.');
                setIsLoading(false);
                return;
            }

            const storedConfig = sessionStorage.getItem('interviewConfig');
            const storedCvData = sessionStorage.getItem('parsedCvData');

            // Parse config for job details
            if (storedConfig) {
                try {
                    const parsed = JSON.parse(storedConfig);
                    setConfig(parsed);
                    setJobDescription(
                        JSON.stringify({
                            title: parsed.jobTitle || 'General Position',
                            description: parsed.jobDescription || '',
                            requirements: parsed.jobRequirements || '',
                        }),
                    );
                } catch {
                    console.error('Failed to parse stored config');
                    setError(
                        'Invalid interview configuration. Please start a new interview.',
                    );
                    setIsLoading(false);
                    return;
                }
            } else {
                setError(
                    'No interview configuration found. Please start a new interview.',
                );
                setIsLoading(false);
                return;
            }

            // Set CV data - try sessionStorage first, then API
            if (storedCvData) {
                setCvData(storedCvData);
            } else {
                // Fetch CV data from API
                try {
                    console.log('Fetching CV data for user:', user.id);
                    const cvResult = await getUserCV(user.id);

                    if (cvResult.success && cvResult.data) {
                        console.log(
                            'CV data fetched successfully:',
                            cvResult.data,
                        );
                        // The CV data should already be in the correct format
                        const cvJson =
                            typeof cvResult.data === 'string'
                                ? cvResult.data
                                : JSON.stringify(cvResult.data);
                        setCvData(cvJson);
                        // Store in sessionStorage for future use
                        sessionStorage.setItem('parsedCvData', cvJson);
                    } else {
                        console.error('CV fetch failed:', cvResult.error);
                        setError(
                            cvResult.error ||
                                'No CV data found. Please upload and parse your CV first.',
                        );
                        setIsLoading(false);
                        return;
                    }
                } catch (err) {
                    console.error('Error fetching CV data:', err);
                    setError('Failed to load CV data. Please try again.');
                    setIsLoading(false);
                    return;
                }
            }

            setIsLoading(false);

            // Start timer
            timerRef.current = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        }

        initializeInterview();
    }, [isAuthenticated, user]);

    // Format elapsed time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleInterviewComplete = (report: unknown) => {
        // Store report in sessionStorage for analysis page
        sessionStorage.setItem('interviewReport', JSON.stringify(report));
        // Navigate to analysis page
        router.push('/interview/analysis');
    };

    const handleError = (errorMessage: string) => {
        setError(errorMessage);
    };

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto">
                {/* Steps header */}
                <InterviewSteps
                    active={2}
                    showTime
                    time={formatTime(elapsedTime)}
                />

                {isLoading && (
                    <div className="flex items-center justify-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin text-accent" />
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3 text-red-400">
                        <AlertCircle className="w-5 h-5" />
                        <div>
                            <p className="font-medium">{error}</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push('/interview')}
                                className="mt-2"
                            >
                                Start New Interview
                            </Button>
                        </div>
                    </div>
                )}

                {!isLoading && !error && (
                    <div className="space-y-6">
                        {/* Interview Info Card */}
                        <div className="p-6 bg-background/40 border border-white/10 rounded-xl">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-semibold text-white mb-2 flex items-center gap-2">
                                        <Mic className="w-6 h-6 text-accent" />
                                        Voice Interview in Progress
                                    </h2>
                                    {config && (
                                        <p className="text-gray-400">
                                            Position:{' '}
                                            <span className="text-white font-medium">
                                                {config.jobTitle}
                                            </span>
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-400">
                                        Session Time
                                    </p>
                                    <p className="text-xs text-gray-500 font-mono">
                                        {formatTime(elapsedTime)}
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3 text-green-400">
                                <CheckCircle2 className="w-5 h-5" />
                                <div>
                                    <p className="font-medium">
                                        Native Voice Interview Ready
                                    </p>
                                    <p className="text-sm text-green-300/80">
                                        Click "Start Interview" below to begin
                                        your voice interview session.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Gradio Voice Interview Component */}
                        <div className="p-6 bg-background/40 border border-white/10 rounded-xl">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Volume2 className="w-5 h-5 text-accent" />
                                Voice Interview Interface
                            </h3>

                            <GradioVoiceInterview
                                cvData={cvData}
                                jobDescription={jobDescription}
                                onInterviewComplete={handleInterviewComplete}
                                onError={handleError}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
