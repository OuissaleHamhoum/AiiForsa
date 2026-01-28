'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useJobApplications } from '@/hooks/useJobApplications';
import { ApplicationStatus } from '@/types/job.types';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAppliedJobs } from '../context/AppliedJobsContext';
import { AddForm } from './components/add-form';
import { JobCard } from './components/jobcard';
import { ModifyForm } from './components/modify-form';

export default function Page() {
    const { applications, loading, error, updateStatus, refresh } =
        useJobApplications();
    const [showAddForm, setShowAddForm] = useState(false);
    const [showModifyForm, setShowModifyForm] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<any>(null);
    const { setOnAddClick } = useAppliedJobs();

    // Register the add click handler with the context
    useEffect(() => {
        setOnAddClick(() => () => setShowAddForm(true));
        return () => setOnAddClick(undefined);
    }, [setOnAddClick]);

    const handleStatusChange = (applicationId: string, newStatus: string) => {
        updateStatus(applicationId, newStatus as ApplicationStatus);
    };

    const handleEdit = (applicationId: string) => {
        const app = applications.find(a => a.applicationId === applicationId);
        if (app) {
            setSelectedApplication(app);
            setShowModifyForm(true);
        }
    };

    const handleAddSuccess = () => {
        refresh(); // Refresh the applications list after adding
    };

    if (loading) {
        return (
            <main className="px-10 pb-8">
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-[#1e1e1e] border border-white/5 p-4 rounded-lg space-y-3"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2.5 flex-1">
                                    <Skeleton className="w-9 h-9 rounded bg-white/5" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-3/4 bg-white/5" />
                                        <Skeleton className="h-3 w-1/2 bg-white/5" />
                                    </div>
                                </div>
                                <Skeleton className="h-5 w-16 rounded-full bg-white/5" />
                            </div>
                            <div className="space-y-2 ml-[42px]">
                                <Skeleton className="h-3 w-full bg-white/5" />
                                <Skeleton className="h-3 w-2/3 bg-white/5" />
                                <Skeleton className="h-3 w-3/4 bg-white/5" />
                            </div>
                            <Skeleton className="h-8 w-full bg-white/5" />
                        </div>
                    ))}
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="p-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-red-500">Error: {error}</div>
                </div>
            </main>
        );
    }

    return (
        <main className="px-10 pb-8">
            {/* Job Cards Grid */}
            {applications.length === 0 ? (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <p className="text-white/60 mb-4">
                            No job applications found
                        </p>
                        <Button
                            onClick={() => setShowAddForm(true)}
                            className="bg-[#cf6318] hover:bg-[#b55516] text-white gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Your First Job
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {applications.map(app => (
                        <JobCard
                            key={app.applicationId}
                            job={{
                                id: app.applicationId,
                                title: app.title,
                                company: app.company,
                                location: app.location,
                                salary: app.salary,
                                appliedDate: app.appliedDate,
                                status: app.status,
                            }}
                            onStatusChange={handleStatusChange}
                            onEdit={handleEdit}
                        />
                    ))}
                </div>
            )}

            {/* Add Form Dialog */}
            <AddForm
                open={showAddForm}
                onOpenChange={setShowAddForm}
                onSuccess={handleAddSuccess}
            />

            {/* Modify Form Dialog */}
            {selectedApplication && (
                <ModifyForm
                    open={showModifyForm}
                    onOpenChange={setShowModifyForm}
                    onSuccess={handleAddSuccess}
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
        </main>
    );
}
