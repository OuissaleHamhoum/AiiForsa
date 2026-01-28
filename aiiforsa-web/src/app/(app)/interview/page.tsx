'use client';

import { getUserCV } from '@/actions/job-actions';
import {
    getVoiceInterviewHistory,
    getVoiceInterviewPdfUrl,
    getVoiceInterviewReport,
    getVoiceInterviewSessions,
    VoiceInterviewHistoryResponse,
    VoiceInterviewReportResponse,
    VoiceInterviewSession,
} from '@/actions/interview-actions';
import InterviewSteps from '@/components/interview/InterviewSteps';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    AlertCircle,
    Briefcase,
    CheckCircle2,
    Download,
    FileText,
    History,
    Loader2,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function InterviewSetupPage() {
    const { data: session, status: sessionStatus } = useSession();

    // CV data state
    const [parsedCv, setParsedCv] = useState<string>('');
    const [cvLoading, setCvLoading] = useState(true);
    const [cvError, setCvError] = useState('');

    // Form state - simplified to match Gradio function needs
    const [jobTitle, setJobTitle] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [jobRequirements, setJobRequirements] = useState('');

    // Interview start state
    const [isStarting, setIsStarting] = useState(false);
    const [startError, setStartError] = useState('');

    // Interview history & reports state
    const [sessions, setSessions] = useState<VoiceInterviewSession[]>([]);
    const [latestHistory, setLatestHistory] =
        useState<VoiceInterviewHistoryResponse | null>(null);
    const [latestReport, setLatestReport] =
        useState<VoiceInterviewReportResponse | null>(null);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [historyError, setHistoryError] = useState('');

    // Fetch user's parsed CV on mount
    useEffect(() => {
        async function loadCV() {
            if (sessionStatus === 'loading') return;
            if (!session?.user?.id) {
                setCvError('Please log in to use the interview simulator');
                setCvLoading(false);
                return;
            }

            setCvLoading(true);
            setCvError('');

            try {
                const result = await getUserCV(session.user.id);

                if (!result.success || !result.data) {
                    setCvError(
                        result.error ||
                            'Failed to load CV. Please upload and parse your CV first in your profile.',
                    );
                    return;
                }

                // Validate CV data exists
                if (
                    !result.data ||
                    typeof result.data !== 'object' ||
                    Object.keys(result.data).length === 0
                ) {
                    setCvError(
                        'Your CV has not been parsed yet. Please upload your CV in your profile first.',
                    );
                    return;
                }

                // Set CV JSON string
                setParsedCv(JSON.stringify(result.data));
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : 'An error occurred while loading your CV';
                setCvError(errorMessage);
            } finally {
                setCvLoading(false);
            }
        }

        loadCV();
    }, [session, sessionStatus]);

    // Fetch interview history and sessions on mount
    useEffect(() => {
        async function loadInterviewData() {
            if (sessionStatus === 'loading') return;
            if (!session?.user?.id) return;

            setLoadingHistory(true);
            setHistoryError('');

            try {
                // Fetch all sessions
                const sessionsResult = await getVoiceInterviewSessions();
                if (sessionsResult.success && sessionsResult.data) {
                    setSessions(sessionsResult.data.sessions || []);
                }

                // Fetch latest history
                const historyResult = await getVoiceInterviewHistory();
                if (historyResult.success && historyResult.data) {
                    setLatestHistory(historyResult.data);
                }

                // Fetch latest report
                const reportResult = await getVoiceInterviewReport();
                if (reportResult.success && reportResult.data) {
                    setLatestReport(reportResult.data);
                }
            } catch (err) {
                const errorMessage =
                    err instanceof Error
                        ? err.message
                        : 'Failed to load interview history';
                setHistoryError(errorMessage);
            } finally {
                setLoadingHistory(false);
            }
        }

        loadInterviewData();
    }, [session, sessionStatus]);

    async function handleStartInterview() {
        if (!parsedCv) {
            setStartError('Please upload and parse your CV first');
            return;
        }

        if (!jobTitle.trim()) {
            setStartError('Please provide a job title');
            return;
        }

        if (!jobDescription.trim()) {
            setStartError('Please provide a job description');
            return;
        }

        setIsStarting(true);
        setStartError('');

        try {
            // Parse CV JSON
            const cvData = JSON.parse(parsedCv);

            // Build job description object for voice interview
            const jobDescriptionObj = {
                title: jobTitle.trim(),
                description: jobDescription.trim(),
                requirements: jobRequirements
                    .trim()
                    .split('\n')
                    .filter(r => r.trim()),
                preferredSkills: [],
            };

            // Encode data for URL parameters
            const cvParam = encodeURIComponent(JSON.stringify(cvData));
            const jobParam = encodeURIComponent(
                JSON.stringify(jobDescriptionObj),
            );

            // Redirect directly to Gradio interface with data as URL parameters
            const gradioUrl = `http://localhost:7860/?cv=${cvParam}&job=${jobParam}&theme=dark`;
            window.location.href = gradioUrl;
        } catch (err) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : 'An error occurred while starting the interview';
            setStartError(errorMessage);
        } finally {
            setIsStarting(false);
        }
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto">
                {/* Steps header */}
                <InterviewSteps active={1} />

                {/* CV Status */}
                {cvLoading && (
                    <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center gap-2 text-blue-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Loading your CV data...</span>
                    </div>
                )}

                {cvError && (
                    <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-2 text-yellow-400">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{cvError}</span>
                    </div>
                )}

                {parsedCv && !cvLoading && (
                    <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2 text-green-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm">
                            Your CV is loaded and ready for the interview.
                        </span>
                    </div>
                )}

                {/* Main Card */}
                <div className="p-6 bg-background/40 border border-white/10 rounded-xl shadow-md">
                    <h2 className="text-2xl text-white font-semibold mb-2 flex items-center gap-2">
                        <Briefcase className="w-6 h-6" />
                        Setup AI Interview
                    </h2>
                    <p className="text-sm text-gray-400 mb-6">
                        Configure your interview by providing the job details.
                        The AI interviewer will use your CV and the job
                        information to conduct a realistic mock interview.
                    </p>

                    <div className="space-y-6">
                        {/* CV Preview Section */}
                        <div className="p-4 bg-background/60 border border-white/5 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-accent" />
                                <span className="text-sm font-medium text-white">
                                    Your CV
                                </span>
                            </div>
                            {parsedCv ? (
                                <p className="text-xs text-gray-400">
                                    CV loaded from your profile. The AI will use
                                    this to personalize interview questions.
                                </p>
                            ) : (
                                <p className="text-xs text-yellow-400">
                                    No CV found. Please upload and parse your CV
                                    in your profile first.
                                </p>
                            )}
                        </div>

                        {/* Job Title */}
                        <div>
                            <label className="text-sm text-gray-300 mb-2 block">
                                Job Title{' '}
                                <span className="text-red-400">*</span>
                            </label>
                            <Input
                                className="bg-transparent"
                                placeholder="e.g. Senior Software Engineer, Product Manager, Data Scientist"
                                value={jobTitle}
                                onChange={e => setJobTitle(e.target.value)}
                            />
                        </div>

                        {/* Job Description */}
                        <div>
                            <label className="text-sm text-gray-300 mb-2 block">
                                Job Description{' '}
                                <span className="text-red-400">*</span>
                            </label>
                            <Textarea
                                className="bg-transparent min-h-[120px]"
                                placeholder="Describe the role, key responsibilities, and what the position involves. The AI will use this to craft relevant interview questions."
                                value={jobDescription}
                                onChange={e =>
                                    setJobDescription(e.target.value)
                                }
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Be specific about the role for more relevant
                                interview questions.
                            </p>
                        </div>

                        {/* Requirements (Optional) */}
                        <div>
                            <label className="text-sm text-gray-300 mb-2 block">
                                Requirements & Skills (Optional)
                            </label>
                            <Textarea
                                className="bg-transparent min-h-[80px]"
                                placeholder="List required skills, experience level, qualifications, etc. e.g. 5+ years Python, React experience, Leadership skills"
                                value={jobRequirements}
                                onChange={e =>
                                    setJobRequirements(e.target.value)
                                }
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                If left empty, requirements will be inferred
                                from the job description.
                            </p>
                        </div>

                        {/* Info Box */}
                        <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
                            <h4 className="text-sm font-medium text-accent mb-2">
                                How the Interview Works
                            </h4>
                            <ul className="text-xs text-gray-400 space-y-1">
                                <li>
                                    • The AI interviewer (Alice) will conduct a
                                    structured interview
                                </li>
                                <li>
                                    • Interview sections: Introduction → HR →
                                    Behavioral → Technical → Situational
                                </li>
                                <li>
                                    • Questions are tailored based on your CV
                                    and the job description
                                </li>
                                <li>
                                    • You&apos;ll receive a detailed evaluation
                                    report at the end
                                </li>
                            </ul>
                        </div>

                        {/* Error display */}
                        {startError && (
                            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
                                <AlertCircle className="w-4 h-4" />
                                <span className="text-sm">{startError}</span>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <Button
                                onClick={handleStartInterview}
                                className="mt-4"
                                size="lg"
                                disabled={
                                    isStarting ||
                                    cvLoading ||
                                    !parsedCv ||
                                    !jobTitle.trim() ||
                                    !jobDescription.trim()
                                }
                            >
                                {isStarting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Starting Interview...
                                    </>
                                ) : (
                                    'Start Interview'
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Interview History & Reports Section */}
                <div className="mt-8 p-6 bg-background/40 border border-white/10 rounded-xl shadow-md">
                    <h2 className="text-xl text-white font-semibold mb-4 flex items-center gap-2">
                        <History className="w-5 h-5" />
                        Interview History & Reports
                    </h2>

                    {loadingHistory && (
                        <div className="flex items-center gap-2 text-gray-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">
                                Loading interview history...
                            </span>
                        </div>
                    )}

                    {historyError && (
                        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-2 text-yellow-400 mb-4">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm">{historyError}</span>
                        </div>
                    )}

                    {!loadingHistory && (
                        <div className="space-y-6">
                            {/* Download Latest Report PDF */}
                            <div className="p-4 bg-background/60 border border-white/5 rounded-lg">
                                <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                                    <Download className="w-4 h-4 text-accent" />
                                    Download Interview Report
                                </h3>
                                {latestReport ? (
                                    <div className="space-y-3">
                                        <p className="text-xs text-gray-400">
                                            Latest interview score:{' '}
                                            <span className="text-green-400 font-semibold">
                                                {latestReport.overallScore}/100
                                            </span>
                                            {' | '}Status:{' '}
                                            <span className="text-accent">
                                                {latestReport.status}
                                            </span>
                                        </p>
                                        <Button
                                            onClick={async () => {
                                                const url =
                                                    await getVoiceInterviewPdfUrl(
                                                        latestReport.sessionId,
                                                    );
                                                window.open(url, '_blank');
                                            }}
                                            variant="outline"
                                            className="w-full sm:w-auto"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Download PDF Report
                                        </Button>
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500">
                                        No interview reports available. Complete
                                        an interview to see your report here.
                                    </p>
                                )}
                            </div>

                            {/* Latest Conversation History */}
                            {latestHistory &&
                                latestHistory.history.length > 0 && (
                                    <div className="p-4 bg-background/60 border border-white/5 rounded-lg">
                                        <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-accent" />
                                            Latest Conversation (
                                            {latestHistory.totalExchanges}{' '}
                                            exchanges)
                                        </h3>
                                        <div className="max-h-60 overflow-y-auto space-y-2">
                                            {latestHistory.history
                                                .slice(0, 10)
                                                .map((entry, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`p-2 rounded text-xs ${
                                                            entry.role ===
                                                            'User said'
                                                                ? 'bg-blue-500/10 border-l-2 border-blue-500'
                                                                : 'bg-purple-500/10 border-l-2 border-purple-500'
                                                        }`}
                                                    >
                                                        <span className="text-gray-500 text-[10px]">
                                                            [{entry.section}]
                                                        </span>
                                                        <p className="text-gray-300">
                                                            <span
                                                                className={
                                                                    entry.role ===
                                                                    'User said'
                                                                        ? 'text-blue-400'
                                                                        : 'text-purple-400'
                                                                }
                                                            >
                                                                {entry.role ===
                                                                'User said'
                                                                    ? 'You'
                                                                    : 'Interviewer'}
                                                                :
                                                            </span>{' '}
                                                            {entry.content}
                                                        </p>
                                                    </div>
                                                ))}
                                            {latestHistory.history.length >
                                                10 && (
                                                <p className="text-xs text-gray-500 text-center pt-2">
                                                    ... and{' '}
                                                    {latestHistory.history
                                                        .length - 10}{' '}
                                                    more exchanges
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* All Sessions List */}
                            {sessions.length > 0 && (
                                <div className="p-4 bg-background/60 border border-white/5 rounded-lg">
                                    <h3 className="text-sm font-medium text-white mb-3">
                                        All Interview Sessions (
                                        {sessions.length})
                                    </h3>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {sessions.map(s => (
                                            <div
                                                key={s.sessionId}
                                                className="flex items-center justify-between p-2 bg-background/40 rounded text-xs"
                                            >
                                                <div>
                                                    <p className="text-gray-300">
                                                        {s.jobDescription
                                                            ?.title ||
                                                            'Interview Session'}
                                                    </p>
                                                    <p className="text-gray-500 text-[10px]">
                                                        {new Date(
                                                            s.createdAt,
                                                        ).toLocaleDateString()}{' '}
                                                        - {s.status}
                                                    </p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={async () => {
                                                        const url =
                                                            await getVoiceInterviewPdfUrl(
                                                                s.sessionId,
                                                            );
                                                        window.open(
                                                            url,
                                                            '_blank',
                                                        );
                                                    }}
                                                >
                                                    <Download className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!latestHistory &&
                                !latestReport &&
                                sessions.length === 0 &&
                                !loadingHistory && (
                                    <p className="text-sm text-gray-500 text-center py-4">
                                        No interview history yet. Start an
                                        interview above to begin!
                                    </p>
                                )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
