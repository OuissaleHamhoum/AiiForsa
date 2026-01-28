'use client';

import { getAllJobs, getUserJobApplications } from '@/actions';
import { EnrichedJobApplication, enrichJobApplication } from '@/lib/job-utils';
import { ApplicationStatus, Job } from '@/types/job.types';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { useApplicationStatus } from './useApplicationStatus';

export function useJobApplications() {
    const { data: session } = useSession();
    const [applications, setApplications] = useState<EnrichedJobApplication[]>(
        [],
    );
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const {
        getStatus,
        updateStatus: updateLocalStatus,
        isLoaded: statusLoaded,
    } = useApplicationStatus();

    /**
     * Fetch jobs and applications from backend
     */
    const fetchData = useCallback(async () => {
        if (!session?.user?.id || !statusLoaded) return;

        setLoading(true);
        setError(null);

        try {
            // Fetch jobs and applications in parallel
            const [jobsResult, appsResult] = await Promise.all([
                getAllJobs(),
                getUserJobApplications(session.user.id, 1, 100),
            ]);

            if (jobsResult.error) {
                throw new Error(jobsResult.error);
            }

            if (appsResult.error) {
                throw new Error(appsResult.error);
            }

            const fetchedJobs = jobsResult.data || [];
            const fetchedApps = appsResult.data?.data || [];

            setJobs(fetchedJobs);

            // Enrich applications with job data and local status
            const enrichedApps = fetchedApps.map(app => {
                const job = fetchedJobs.find(
                    j => j.id.toString() === app.jobId,
                );
                const localStatus = getStatus(app.applicationId);
                return enrichJobApplication(app, job, localStatus);
            });

            setApplications(enrichedApps);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to fetch data',
            );
        } finally {
            setLoading(false);
        }
    }, [session?.user?.id, statusLoaded, getStatus]);

    /**
     * Update application status
     */
    const updateStatus = useCallback(
        (applicationId: string, newStatus: ApplicationStatus) => {
            // Update local state
            setApplications(prev =>
                prev.map(app =>
                    app.applicationId === applicationId
                        ? { ...app, status: newStatus }
                        : app,
                ),
            );

            // Update local storage
            updateLocalStatus(applicationId, newStatus);

            // TODO: When backend adds status field, also update via API
            // await updateJobApplication(applicationId, { status: newStatus });
        },
        [updateLocalStatus],
    );

    /**
     * Refresh data from backend
     */
    const refresh = useCallback(() => {
        fetchData();
    }, [fetchData]);

    // Fetch data on mount and when session changes
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        applications,
        jobs,
        loading,
        error,
        updateStatus,
        refresh,
    };
}
