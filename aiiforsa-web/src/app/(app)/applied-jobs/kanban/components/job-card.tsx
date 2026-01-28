'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Briefcase, Calendar, DollarSign, Edit2, MapPin } from 'lucide-react';

interface JobApplication {
    id: string;
    jobTitle: string;
    company: string;
    location: string;
    salary: string;
    appliedDate: string;
    status: 'applied' | 'interview' | 'on-hold' | 'rejected';
    jobId: string;
}

interface JobCardProps {
    job: JobApplication;
    onEdit?: (jobId: string) => void;
}

export function JobCard({ job, onEdit }: JobCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: job.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const getStatusBadge = () => {
        const badges = {
            applied: {
                text: 'Applied',
                className:
                    'bg-[#3b82f6]/20 text-[#60a5fa] border-[#3b82f6]/30 text-xs',
            },
            interview: {
                text: 'Interview',
                className:
                    'bg-[#10b981]/20 text-[#34d399] border-[#10b981]/30 text-xs',
            },
            'on-hold': {
                text: 'On Hold',
                className:
                    'bg-[#f59e0b]/20 text-[#fbbf24] border-[#f59e0b]/30 text-xs',
            },
            rejected: {
                text: 'Rejected',
                className:
                    'bg-[#ef4444]/20 text-[#f87171] border-[#ef4444]/30 text-xs',
            },
        };
        return badges[job.status];
    };

    const statusBadge = getStatusBadge();

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Card className="border border-white/10 bg-[#1e1e1e]/80 backdrop-blur-sm hover:bg-[#252525]/80 transition-all cursor-grab active:cursor-grabbing">
                <CardContent className="p-4">
                    {/* Header with Icon and Badge */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-md bg-[#cf6318]/20 flex items-center justify-center flex-shrink-0">
                                <Briefcase className="w-4 h-4 text-[#cf6318]" />
                            </div>
                            <Badge className={statusBadge.className}>
                                {statusBadge.text}
                            </Badge>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-white/50 hover:text-white hover:bg-white/10 -mt-1 -mr-1"
                            onClick={e => {
                                e.stopPropagation();
                                onEdit?.(job.id);
                            }}
                        >
                            <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>

                    {/* Job Title and Company */}
                    <div className="mb-3">
                        <h3 className="font-semibold text-white text-[15px] leading-tight mb-1">
                            {job.jobTitle}
                        </h3>
                        <p className="text-[13px] text-[#94a3b8]">
                            {job.company}
                        </p>
                    </div>

                    {/* Job Details */}
                    <div className="space-y-1.5 text-[13px]">
                        <div className="flex items-center gap-2 text-[#94a3b8]">
                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#94a3b8]">
                            <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{job.salary}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#94a3b8]">
                            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>Applied: {job.appliedDate}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
