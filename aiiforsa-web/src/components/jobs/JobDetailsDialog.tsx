'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { JobItem } from './types';

export function JobDetailsDialog({
    job,
    open,
    onOpenChange,
    onApply,
    onCover,
    onMatch,
}: {
    job: JobItem | null;
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onApply: (job: JobItem) => void;
    onCover: (job: JobItem) => void;
    onMatch: (job: JobItem) => void;
}) {
    if (!job) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>{job.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-muted/40 rounded-md p-2">
                            {job.location}
                        </div>
                        <div className="bg-muted/40 rounded-md p-2">
                            $
                            {`$${job.salaryMin?.toLocaleString()} - $${job.salaryMax?.toLocaleString()}`}
                        </div>
                        <div className="bg-muted/40 rounded-md p-2">
                            {job.type}
                        </div>
                        <div className="bg-muted/40 rounded-md p-2">
                            {new Date(job.postedAt).toLocaleDateString()}
                        </div>
                    </div>

                    <ScrollArea className="h-48 rounded-md border p-3">
                        <div className="space-y-3">
                            <p className="text-sm">{job.description}</p>

                            {job.requirements &&
                                job.requirements.length > 0 && (
                                    <div>
                                        <p className="font-medium mt-2 mb-2">
                                            Requirements
                                        </p>
                                        <ul className="list-disc pl-5 space-y-1 text-sm max-h-28 overflow-auto">
                                            {job.requirements.map((r, i) => (
                                                <li key={i}>{r}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                            {/* External link box: shown independently of requirements */}
                            {job.externalUrl && (
                                <div className="mt-3">
                                    <div className="bg-muted/40 rounded-md p-2">
                                        <a
                                            href={job.externalUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm underline decoration-2 underline-offset-2 text-orange-400 hover:text-orange-300"
                                        >
                                            View original posting
                                        </a>
                                    </div>
                                </div>
                            )}

                            {job.benefits && job.benefits.length > 0 && (
                                <div>
                                    <p className="font-medium mt-3 mb-2">
                                        Benefits
                                    </p>
                                    <div className="max-h-24 overflow-auto">
                                        <div className="flex flex-wrap gap-2">
                                            {job.benefits.map((b, i) => (
                                                <Badge
                                                    key={i}
                                                    variant="outline"
                                                >
                                                    {b}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    <div className="flex gap-3 justify-between">
                        <Button
                            onClick={() => onApply(job)}
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                            Apply for this Job
                        </Button>
                        <Button
                            onClick={() => onCover(job)}
                            variant="secondary"
                        >
                            Generate Cover Letter
                        </Button>
                        <Button onClick={() => onMatch(job)} variant="outline">
                            Check CV Match
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
