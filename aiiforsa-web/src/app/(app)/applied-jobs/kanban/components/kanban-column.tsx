'use client';

import { Badge } from '@/components/ui/badge';
import { useDroppable } from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { JobCard } from './job-card';

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

interface KanbanColumnProps {
    id: string;
    title: string;
    jobs: JobApplication[];
    onEdit?: (jobId: string) => void;
}

export function KanbanColumn({ id, title, jobs, onEdit }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({ id });

    const getHeaderStyles = () => {
        const styles = {
            applied: 'bg-[#3b82f6] text-white',
            interview: 'bg-[#10b981] text-white',
            'on-hold': 'bg-[#f59e0b] text-white',
            rejected: 'bg-[#ef4444] text-white',
        };
        return styles[id as keyof typeof styles] || 'bg-white/5 text-white';
    };

    return (
        <div className="flex flex-col h-full min-w-[280px]">
            {/* Column Header */}
            <div
                className={`rounded-lg px-4 py-2.5 flex items-center justify-between mb-3 ${getHeaderStyles()}`}
            >
                <h3 className="font-semibold text-[15px]">{title}</h3>
                <Badge className="bg-white/20 text-white border-0 hover:bg-white/30 px-2 py-0.5 h-5 text-xs font-medium">
                    {jobs.length}
                </Badge>
            </div>

            {/* Column Content */}
            <div
                ref={setNodeRef}
                className={`flex-1 rounded-lg border border-white/5 bg-transparent p-3 space-y-3 min-h-[500px] transition-colors ${
                    isOver ? 'bg-white/5 border-white/10' : ''
                }`}
            >
                <SortableContext
                    items={jobs.map(j => j.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {jobs.map(job => (
                        <JobCard key={job.id} job={job} onEdit={onEdit} />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
}
