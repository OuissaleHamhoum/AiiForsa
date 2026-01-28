'use client';

import { getAllJobs, getUserCV, matchCVWithJobsDatabase } from '@/actions/job-actions';
import { CoverLetterDialog } from '@/components/jobs/CoverLetterDialog';
import { CvMatchDialog } from '@/components/jobs/CvMatch';
import { JobDetailsDialog } from '@/components/jobs/JobDetailsDialog';
import { JobItem } from '@/components/jobs/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Job } from '@/types/job.types';
import { useEffect, useMemo, useState } from 'react';

// Helper function to map backend Job to frontend JobItem
function mapJobToJobItem(job: Job): JobItem {
    return {
        id: job.id.toString(),
        title: job.title,
        company: job.companyName,
        location: job.location || 'Remote',
        salaryMin: job.salaryMin || undefined,
        salaryMax: job.salaryMax || undefined,
        type: mapJobType(job.type),
        postedAt: job.postedAt,
        description: job.description || 'No description available',
        requirements: job.requirements
            ? job.requirements.split('\n').filter(r => r.trim())
            : [],
        benefits: job.benefits
            ? job.benefits.split('\n').filter((b: string) => b.trim())
            : [],
        externalUrl: job.externalUrl,
    };
}

// Helper function to map backend job type to frontend job type
function mapJobType(type: Job['type']): JobItem['type'] {
    switch (type) {
        case 'FULL_TIME':
            return 'Full-time';
        case 'PART_TIME':
            return 'Part-time';
        case 'CONTRACT':
            return 'Contract';
        case 'FREELANCE':
            return 'Remote';
        case 'INTERNSHIP':
            return 'Full-time'; // Default to full-time for internship
        default:
            return 'Full-time';
    }
}

export default function JobsPage() {
    const [jobs, setJobs] = useState<JobItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const [location, setLocation] = useState('');
    const [minSalary, setMinSalary] = useState('');
    const [maxSalary, setMaxSalary] = useState('');
    const [jobType, setJobType] = useState('');

    const [selected, setSelected] = useState<JobItem | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showCover, setShowCover] = useState(false);
    const [showMatch, setShowMatch] = useState(false);
    const [appliedMsg, setAppliedMsg] = useState<string | null>(null);
    const [matchingJobs, setMatchingJobs] = useState<JobItem[]>([]);
    const [showMatchingJobs, setShowMatchingJobs] = useState(false);

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await getAllJobs();
            if (result.success && result.data) {
                const jobItems = result.data.map(mapJobToJobItem);
                setJobs(jobItems);
            } else {
                setError(result.error || 'Failed to load jobs');
                // Keep empty jobs array instead of crashing
                setJobs([]);
            }
        } catch {
            setError(
                'Failed to connect to job service. Please ensure the backend is running.',
            );
            // Keep empty jobs array instead of crashing
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    const reload = () => {
        loadJobs();
    };

    const filtered = useMemo(() => {
        const q = query.toLowerCase();
        return jobs.filter(j => {
            const text = `${j.title} ${j.company} ${j.location}`.toLowerCase();
            if (q && !text.includes(q)) return false;
            if (
                location &&
                !j.location.toLowerCase().includes(location.toLowerCase())
            )
                return false;
            const min = parseInt(minSalary || '0', 10);
            const max = parseInt(maxSalary || '0', 10);
            if (min && (j.salaryMin ?? 0) < min) return false;
            if (max && (j.salaryMax ?? 0) > max) return false;
            if (jobType && j.type !== jobType) return false;
            return true;
        });
    }, [jobs, query, location, minSalary, maxSalary, jobType]);

    const openDetails = (job: JobItem) => {
        setSelected(job);
        setShowDetails(true);
    };

    const onApply = async (job: JobItem) => {
        setShowDetails(false);
        try {
            const payload = {
                jobId: parseInt(job.id, 10),
                appliedAt: new Date().toISOString(),
                isExternal: !!job.externalUrl,
            };

            const resp = await fetch('/api/job-applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const json = await resp.json();

            if (resp.ok) {
                setAppliedMsg(`${job.title} at ${job.company}: Job applied`);
            } else {
                // Show server-provided message when possible
                const errMsg =
                    (json && (json.error?.message || json.error)) ||
                    'Unknown error';
                setAppliedMsg('Failed to apply: ' + errMsg);
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('apply error', error);
            setAppliedMsg('Failed to apply: network error');
        }

        setTimeout(() => setAppliedMsg(null), 1500);
    };

    const onCover = (job: JobItem) => {
        setShowDetails(false);
        setSelected(job);
        setShowCover(true);
    };

    const onMatch = (job: JobItem) => {
        setShowDetails(false);
        setSelected(job);
        setShowMatch(true);
    };

    const findMatchingJobs = async () => {
        try {
            setLoading(true);
            setError(null);
            // Get user's CV
            const cvResult = await getUserCV('current'); // Assuming current user
            if (!cvResult.success) {
                throw new Error(cvResult.error || 'Failed to load CV');
            }
            const cvText = typeof cvResult.data === 'string' ? cvResult.data : JSON.stringify(cvResult.data);
            const result = await matchCVWithJobsDatabase(cvText, 10);
            if (result.success && result.data) {
                // Assuming result.data is an array of job matches
                const matchedJobItems = result.data.map((match: any) => ({
                    id: match.id || match.metadata?.id || 'unknown',
                    title: match.metadata?.title || 'Unknown Title',
                    company: match.metadata?.companyName || 'Unknown Company',
                    location: match.metadata?.location || 'Remote',
                    salaryMin: match.metadata?.salaryMin ? parseFloat(match.metadata.salaryMin) : undefined,
                    salaryMax: match.metadata?.salaryMax ? parseFloat(match.metadata.salaryMax) : undefined,
                    type: match.metadata?.type || 'Full-time',
                    postedAt: new Date().toISOString(), // Placeholder
                    description: match.metadata?.description || 'No description',
                    requirements: match.metadata?.requirements ? match.metadata.requirements.split('\n').filter((r: string) => r.trim()) : [],
                    benefits: match.metadata?.benefits ? match.metadata.benefits.split('\n').filter((b: string) => b.trim()) : [],
                    externalUrl: match.metadata?.externalUrl,
                }));
                setMatchingJobs(matchedJobItems);
                setShowMatchingJobs(true);
            } else {
                setError(result.error || 'Failed to find matching jobs');
            }
        } catch (err) {
            setError('Failed to find matching jobs');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-8">
            <div className="mx-auto max-w-6xl space-y-6">
                <h1 className="text-3xl font-bold">Matched Jobs</h1>

                {/* Search Bar with Reload */}
                <Card className="p-4 bg-background/60">
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Search by title or company..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                        />
                        <Button
                            onClick={reload}
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                            Reload
                        </Button>
                        <Button
                            onClick={findMatchingJobs}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            Find Jobs Matching My CV
                        </Button>
                    </div>

                    <button
                        className="text-sm mt-3 text-muted-foreground hover:text-foreground"
                        onClick={() => setAdvancedOpen(v => !v)}
                    >
                        {advancedOpen
                            ? 'Hide Advanced Search'
                            : 'Show Advanced Search'}
                    </button>

                    {advancedOpen && (
                        <div className="grid md:grid-cols-4 gap-3 mt-3">
                            <Input
                                placeholder="Location"
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                            />
                            <Input
                                placeholder="Min Salary"
                                type="number"
                                value={minSalary}
                                onChange={e => setMinSalary(e.target.value)}
                            />
                            <Input
                                placeholder="Max Salary"
                                type="number"
                                value={maxSalary}
                                onChange={e => setMaxSalary(e.target.value)}
                            />
                            <Input
                                placeholder="Job Type (Full-time, Remote, ...)"
                                value={jobType}
                                onChange={e =>
                                    setJobType(e.target.value as any)
                                }
                            />
                        </div>
                    )}
                </Card>

                {loading && (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">Loading jobs...</p>
                    </div>
                )}

                {error && (
                    <div className="text-center py-8">
                        <p className="text-red-500">{error}</p>
                        <Button
                            onClick={reload}
                            className="mt-2 bg-orange-500 hover:bg-orange-600 text-white"
                        >
                            Try Again
                        </Button>
                    </div>
                )}

                {!loading && !error && (
                    <p className="text-sm text-muted-foreground">
                        Found {filtered.length} jobs
                    </p>
                )}

                {!loading && !error && (
                    <div className="space-y-3">
                        {filtered.map(job => (
                            <Card
                                key={job.id}
                                className="p-6 cursor-pointer"
                                onClick={() => openDetails(job)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">
                                                {job.title}
                                            </h3>
                                            <Badge variant="secondary">
                                                {new Date(
                                                    job.postedAt,
                                                ).toLocaleDateString()}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {job.company}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {job.location} • {job.type} • $
                                            {`$${job.salaryMin?.toLocaleString()} - $${job.salaryMax?.toLocaleString()}`}
                                        </p>
                                    </div>
                                    {job.externalUrl && (
                                        <div className="ml-4 flex-shrink-0">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(job.externalUrl!, '_blank', 'noopener,noreferrer');
                                                }}
                                                className="text-orange-600 border-orange-600 hover:bg-orange-50"
                                            >
                                                View Job
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {showMatchingJobs && matchingJobs.length > 0 && (
                    <div className="space-y-3 mt-8">
                        <h2 className="text-2xl font-bold">Jobs Matching Your CV</h2>
                        {matchingJobs.map(job => (
                            <Card
                                key={job.id}
                                className="p-6 cursor-pointer"
                                onClick={() => openDetails(job)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold">
                                                {job.title}
                                            </h3>
                                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                                AI Matched
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {job.company}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {job.location} • {job.type} • $
                                            {`$${job.salaryMin?.toLocaleString()} - $${job.salaryMax?.toLocaleString()}`}
                                        </p>
                                    </div>
                                    {job.externalUrl && (
                                        <div className="ml-4 flex-shrink-0">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    window.open(job.externalUrl!, '_blank', 'noopener,noreferrer');
                                                }}
                                                className="text-orange-600 border-orange-600 hover:bg-orange-50"
                                            >
                                                View Job
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {appliedMsg && (
                    <div className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg">
                        {appliedMsg}
                    </div>
                )}
            </div>

            <JobDetailsDialog
                job={selected}
                open={showDetails}
                onOpenChange={setShowDetails}
                onApply={onApply}
                onCover={onCover}
                onMatch={onMatch}
            />

            <CoverLetterDialog
                job={selected}
                open={showCover}
                onOpenChange={setShowCover}
            />
            <CvMatchDialog
                job={selected}
                open={showMatch}
                onOpenChange={setShowMatch}
            />
        </div>
    );
}
