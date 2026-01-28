'use client';

import { ApplicationStatus } from '@/types/job.types';
import { useCallback, useEffect, useState } from 'react';

/**
 * Local storage key for application statuses
 */
const STORAGE_KEY = 'job_application_statuses';

/**
 * Status storage type
 */
type StatusMap = Record<string, ApplicationStatus>;

/**
 * Hook to manage job application statuses locally
 * Since the backend doesn't have a status field yet, we store it locally
 * TODO: Once backend adds status field, migrate to API-based storage
 */
export function useApplicationStatus() {
    const [statuses, setStatuses] = useState<StatusMap>({});
    const [isLoaded, setIsLoaded] = useState(false);

    // Load statuses from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setStatuses(JSON.parse(stored));
            }
        } catch {
            // ignore
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // Save statuses to localStorage whenever they change
    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
            } catch {
                // ignore
            }
        }
    }, [statuses, isLoaded]);

    /**
     * Get status for a specific application
     */
    const getStatus = useCallback(
        (applicationId: string): ApplicationStatus => {
            return statuses[applicationId] || 'applied';
        },
        [statuses],
    );

    /**
     * Update status for a specific application
     */
    const updateStatus = useCallback(
        (applicationId: string, status: ApplicationStatus) => {
            setStatuses(prev => ({
                ...prev,
                [applicationId]: status,
            }));
        },
        [],
    );

    /**
     * Get all statuses
     */
    const getAllStatuses = useCallback(() => {
        return statuses;
    }, [statuses]);

    /**
     * Clear all statuses (useful for logout or reset)
     */
    const clearStatuses = useCallback(() => {
        setStatuses({});
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    /**
     * Bulk update statuses
     */
    const bulkUpdateStatuses = useCallback((updates: StatusMap) => {
        setStatuses(prev => ({
            ...prev,
            ...updates,
        }));
    }, []);

    return {
        getStatus,
        updateStatus,
        getAllStatuses,
        clearStatuses,
        bulkUpdateStatuses,
        isLoaded,
    };
}
