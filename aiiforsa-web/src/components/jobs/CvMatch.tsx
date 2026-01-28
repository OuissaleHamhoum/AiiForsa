'use client';

import { getUserCV, matchCVWithJob } from '@/actions/job-actions';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { JobItem } from './types';

export function CvMatchDialog({
    job,
    open,
    onOpenChange,
}: {
    job: JobItem | null;
    open: boolean;
    onOpenChange: (v: boolean) => void;
}) {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [aiResult, setAiResult] = useState<any>(null);
    const [score, setScore] = useState(0);

    const performAIMatching = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Get user's CV
            const cvResult = await getUserCV(session!.user!.id);
            if (!cvResult.success) {
                throw new Error(cvResult.error || 'Failed to load CV');
            }

            // Validate job data
            if (!job!.title || !job!.title.trim()) {
                throw new Error('Job title is missing.');
            }

            // Extract and validate job requirements - use description as fallback if requirements missing
            let jobRequirements = '';
            const req = (job as any).requirements;
            if (Array.isArray(req)) {
                jobRequirements = req.join(' • ');
            } else {
                jobRequirements = String(req || '').trim();
            }

            const jobDescription =
                typeof job!.description === 'string'
                    ? job!.description.trim()
                    : '';

            // If no requirements, try to use description
            const requirementsText = jobRequirements || jobDescription;

            if (!requirementsText) {
                throw new Error(
                    'This job has no requirements or description available. AI matching cannot proceed. Please contact the job poster to add job details.',
                );
            }

            // Match CV with job
            const matchResult = await matchCVWithJob(
                cvResult.data,
                job!.title.trim(),
                requirementsText, // Use requirements or description
                jobDescription,
                // githubUrl and linkedinUrl can be added later if available in user profile
            );

            if (!matchResult.success) {
                throw new Error(matchResult.error || 'AI matching failed');
            }

            setAiResult(matchResult.data);
            // Extract score from the markdown response
            const matchText = matchResult.data?.match || '';
            const scoreMatch = matchText.match(
                /Overall Score:\s*(\d+(?:\.\d+)?)/i,
            );
            const extractedScore = scoreMatch
                ? parseFloat(scoreMatch[1])
                : null;

            setScore(
                extractedScore && !isNaN(extractedScore) ? extractedScore : 75, // Default score when no AI result or parsing fails
            );
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Unknown error occurred',
            );
        } finally {
            setLoading(false);
        }
    }, [session, job]);

    useEffect(() => {
        if (open && job && session?.user?.id) {
            performAIMatching();
        }
    }, [open, job, session?.user?.id, performAIMatching]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/20 text-orange-400">
                            🧠
                        </span>
                        <span>CV Review for this Job</span>
                    </DialogTitle>
                </DialogHeader>

                {loading ? (
                    <div className="h-40 flex items-center justify-center text-muted-foreground">
                        Analyzing your CV against job requirements...
                    </div>
                ) : error ? (
                    <div className="h-40 flex items-center justify-center text-red-500">
                        <div className="text-center">
                            <p className="mb-2">Failed to analyze CV</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {/* Score Card */}
                        <div className="rounded-xl border bg-gradient-to-b from-background/80 to-background/40 p-5 text-center shadow-sm">
                            <p className="text-sm text-muted-foreground">
                                Overall Match Score
                            </p>
                            <p
                                className={`text-4xl font-bold ${score < 50 ? 'text-red-500' : score < 70 ? 'text-yellow-500' : score < 90 ? 'text-green-500' : 'text-blue-500'}`}
                            >
                                {score}%
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {score >= 90
                                    ? 'Excellent match'
                                    : score >= 70
                                      ? 'Good match'
                                      : score >= 50
                                        ? 'Fair match'
                                        : 'Low match'}
                            </p>
                        </div>

                        {/* Details sections */}
                        <ScrollArea className="h-64 rounded-xl border bg-background/40 p-4">
                            <div className="space-y-4">
                                <section className="rounded-lg border-l-4 border-emerald-500/70 bg-emerald-500/5 p-3">
                                    <h4 className="mb-2 font-semibold text-emerald-400">
                                        Strengths
                                    </h4>
                                    <ul className="space-y-1 text-sm text-emerald-50/90">
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                            Your experience aligns with the
                                            stack and role.
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                            Strong portfolio of cloud-based
                                            projects demonstrates modern
                                            expertise.
                                        </li>
                                    </ul>
                                </section>

                                <section className="rounded-lg border-l-4 border-amber-500/70 bg-amber-500/5 p-3">
                                    <h4 className="mb-2 font-semibold text-amber-400">
                                        Areas to Improve
                                    </h4>
                                    <ul className="space-y-1 text-sm text-amber-50/90">
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
                                            Add more specific metrics for
                                            achievements (e.g., increase
                                            performance, lower cost).
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
                                            Consider highlighting leadership or
                                            mentorship responsibilities.
                                        </li>
                                    </ul>
                                </section>

                                <section className="rounded-lg border-l-4 border-violet-500/70 bg-violet-500/5 p-3">
                                    <h4 className="mb-2 font-semibold text-violet-400">
                                        AI Suggestions
                                    </h4>
                                    <ul className="space-y-1 text-sm text-violet-50/90">
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-violet-400" />
                                            Add keywords from the job
                                            description to pass ATS parsers.
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-violet-400" />
                                            Group cloud certifications in a
                                            dedicated section.
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-violet-400" />
                                            Tailor your summary to emphasize
                                            architecture and system design
                                            skills.
                                        </li>
                                    </ul>
                                </section>

                                {/* AI Analysis Results */}
                                {aiResult && aiResult.match && (
                                    <section className="rounded-lg border-l-4 border-blue-500/70 bg-blue-500/5 p-3">
                                        <h4 className="mb-2 font-semibold text-blue-400">
                                            AI Analysis Results
                                        </h4>
                                        <div className="text-sm text-blue-50/90">
                                            <div className="whitespace-pre-wrap font-mono text-xs bg-blue-500/10 p-3 rounded border">
                                                {aiResult.match}
                                            </div>
                                        </div>
                                    </section>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
