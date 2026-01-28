'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Briefcase, Calendar, DollarSign, Edit2, MapPin } from 'lucide-react';

interface JobCardProps {
    job: {
        id: string;
        title: string;
        company: string;
        location: string;
        salary: string;
        appliedDate: string;
        status: 'applied' | 'interview' | 'on-hold' | 'rejected';
    };
    onStatusChange: (jobId: string, newStatus: string) => void;
    onEdit: (jobId: string) => void;
}

const statusConfig = {
    applied: {
        label: 'Applied',
        color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    },
    interview: {
        label: 'Interview',
        color: 'bg-green-500/10 text-green-500 border-green-500/20',
    },
    'on-hold': {
        label: 'On Hold',
        color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    },
    rejected: {
        label: 'Rejected',
        color: 'bg-red-500/10 text-red-500 border-red-500/20',
    },
};

export function JobCard({ job, onStatusChange, onEdit }: JobCardProps) {
    return (
        <Card className="p-4 relative group">
            {/* Top Row: Icon/Title and Status Badge */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded bg-[#cf6318] flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-[18px] w-[18px] text-white" />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                        <h3 className="text-white font-medium text-sm leading-tight mb-0.5 truncate">
                            {job.title}
                        </h3>
                        <p className="text-white/60 text-xs truncate">
                            {job.company}
                        </p>
                    </div>
                </div>

                {/* Status Badge and Edit Icon */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge
                        variant="outline"
                        className={`${statusConfig[job.status].color} border text-[10px] font-medium px-2 py-0.5 whitespace-nowrap`}
                    >
                        {statusConfig[job.status].label}
                    </Badge>
                    <button
                        onClick={() => onEdit(job.id)}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/5"
                    >
                        <Edit2 className="h-3.5 w-3.5 text-white/60" />
                    </button>
                </div>
            </div>

            {/* Job Details */}
            <div className="space-y-1.5 mb-3.5 ml-[42px]">
                <div className="flex items-center gap-1.5 text-white/60 text-xs">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{job.location}</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/60 text-xs">
                    <DollarSign className="h-3 w-3 flex-shrink-0" />
                    <span>{job.salary}</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/60 text-xs">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    <span>Applied: {job.appliedDate}</span>
                </div>
            </div>

            {/* Update Status Button */}
            <div className="flex items-center gap-2">
                <Select
                    value={job.status}
                    onValueChange={value => onStatusChange(job.id, value)}
                >
                    <SelectTrigger className="flex-1 bg-transparent border-white/10 text-white/80 text-xs h-8 hover:bg-white/5 transition-colors rounded">
                        <SelectValue placeholder="Update Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-white/10">
                        <SelectItem
                            value="applied"
                            className="text-white/90 text-xs focus:bg-white/5 focus:text-white"
                        >
                            Applied
                        </SelectItem>
                        <SelectItem
                            value="interview"
                            className="text-white/90 text-xs focus:bg-white/5 focus:text-white"
                        >
                            Interview
                        </SelectItem>
                        <SelectItem
                            value="on-hold"
                            className="text-white/90 text-xs focus:bg-white/5 focus:text-white"
                        >
                            On Hold
                        </SelectItem>
                        <SelectItem
                            value="rejected"
                            className="text-white/90 text-xs focus:bg-white/5 focus:text-white"
                        >
                            Rejected
                        </SelectItem>
                    </SelectContent>
                </Select>
                <button
                    onClick={() => onEdit(job.id)}
                    className="p-1.5 rounded border border-white/10 hover:bg-white/5 transition-colors"
                >
                    <Edit2 className="h-3.5 w-3.5 text-white/60" />
                </button>
            </div>
        </Card>
    );
}
