'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useJobApplications } from '@/hooks/useJobApplications';
import { EnrichedJobApplication } from '@/lib/job-utils';
import { ApplicationStatus } from '@/types/job.types';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { useState } from 'react';
import { ModifyForm } from '../grid/components/modify-form';
import { JobCard } from './components/job-card';
import { KanbanColumn } from './components/kanban-column';

interface JobCardData {
    id: string;
    jobTitle: string;
    company: string;
    location: string;
    salary: string;
    appliedDate: string;
    status: ApplicationStatus;
    jobId: string;
}

const COLUMNS = [
    { id: 'applied', title: 'Applied', color: 'blue' },
    { id: 'interview', title: 'Interview', color: 'green' },
    { id: 'on-hold', title: 'On Hold', color: 'yellow' },
    { id: 'rejected', title: 'Rejected', color: 'red' },
];

export default function KanbanPage() {
    const { applications, loading, error, updateStatus, refresh } =
        useJobApplications();
    const [activeJob, setActiveJob] = useState<JobCardData | null>(null);
    const [showModifyForm, setShowModifyForm] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<any>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
    );

    // Convert EnrichedJobApplication to JobCardData format
    const convertToCardData = (app: EnrichedJobApplication): JobCardData => ({
        id: app.applicationId,
        jobTitle: app.title,
        company: app.company,
        location: app.location,
        salary: app.salary,
        appliedDate: app.appliedDate,
        status: app.status,
        jobId: app.jobId,
    });

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const app = applications.find(a => a.applicationId === active.id);
        if (app) {
            setActiveJob(convertToCardData(app));
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) {
            // Card dropped outside - return to original position
            setActiveJob(null);
            return;
        }

        const applicationId = active.id as string;
        const newStatus = over.id as ApplicationStatus;

        // Validate that the drop target is a valid column
        const validStatuses: ApplicationStatus[] = [
            'applied',
            'interview',
            'on-hold',
            'rejected',
        ];

        if (!validStatuses.includes(newStatus)) {
            // Invalid drop target - return to original position
            setActiveJob(null);
            return;
        }

        // Update status via hook (updates both local state and localStorage)
        updateStatus(applicationId, newStatus);

        setActiveJob(null);
    };

    const handleDragCancel = () => {
        // Reset state when drag is cancelled
        setActiveJob(null);
    };

    const getJobsByStatus = (status: ApplicationStatus): JobCardData[] => {
        return applications
            .filter(app => app.status === status)
            .map(convertToCardData);
    };

    const handleEdit = (jobId: string) => {
        const app = applications.find(a => a.applicationId === jobId);
        if (app) {
            setSelectedApplication(app);
            setShowModifyForm(true);
        }
    };

    const handleModifySuccess = () => {
        refresh(); // Refresh the applications list after editing
    };

    if (loading) {
        return (
            <div className="mx-10 mt-8 pb-8">
                <div className="flex gap-6 overflow-x-auto">
                    {COLUMNS.map(column => (
                        <div
                            key={column.id}
                            className="flex flex-col h-full min-w-[280px]"
                        >
                            <Skeleton className="h-10 rounded-lg mb-3 bg-white/5" />
                            <div className="flex-1 rounded-lg border border-white/5 p-3 space-y-3 min-h-[500px]">
                                {[...Array(3)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="border border-white/10 bg-[#1e1e1e]/80 rounded-lg p-4 space-y-3"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-2.5">
                                                <Skeleton className="w-9 h-9 rounded-md bg-white/5" />
                                                <Skeleton className="h-5 w-16 rounded-full bg-white/5" />
                                            </div>
                                            <Skeleton className="h-7 w-7 rounded bg-white/5" />
                                        </div>
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-3/4 bg-white/5" />
                                            <Skeleton className="h-3 w-1/2 bg-white/5" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Skeleton className="h-3 w-full bg-white/5" />
                                            <Skeleton className="h-3 w-2/3 bg-white/5" />
                                            <Skeleton className="h-3 w-3/4 bg-white/5" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-10 mt-8 pb-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-red-500">Error: {error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-10 mt-8 pb-8">
            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                    {COLUMNS.map(column => (
                        <KanbanColumn
                            key={column.id}
                            id={column.id}
                            title={column.title}
                            jobs={getJobsByStatus(
                                column.id as ApplicationStatus,
                            )}
                            onEdit={handleEdit}
                        />
                    ))}
                </div>

                <DragOverlay>
                    {activeJob ? (
                        <div className="opacity-90 rotate-2 scale-105">
                            <JobCard job={activeJob} />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Modify Form Dialog */}
            {selectedApplication && (
                <ModifyForm
                    open={showModifyForm}
                    onOpenChange={setShowModifyForm}
                    onSuccess={handleModifySuccess}
                    jobApplication={{
                        id: selectedApplication.applicationId,
                        title: selectedApplication.title,
                        company: selectedApplication.company,
                        location: selectedApplication.location,
                        salary: selectedApplication.salary,
                        appliedDate: selectedApplication.appliedDate,
                        status: selectedApplication.status,
                        jobId: selectedApplication.jobId,
                    }}
                />
            )}
        </div>
    );
}
