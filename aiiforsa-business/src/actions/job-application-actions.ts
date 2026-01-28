'use server';

import { handleRequest } from '@/lib/server-request';
import {
    CreateJobApplicationDto,
    JobApplication,
    JobApplicationStats,
    PaginatedResponse,
    UpdateJobApplicationDto,
} from '@/types/job.types';

/**
 * Get all job applications for a specific user
 */
export async function getUserJobApplications(
    userId: string,
    page: number = 1,
    limit: number = 100,
): Promise<{
    success: boolean;
    data?: PaginatedResponse<JobApplication>;
    error?: string;
}> {
    const result = await handleRequest<PaginatedResponse<JobApplication>>(
        'GET',
        `/job-applications/user/${userId}?page=${page}&limit=${limit}`,
        undefined,
        true,
    );

    if (result.error) {
        return {
            success: false,
            error: result.error.message,
        };
    }

    return {
        success: true,
        data: result.data,
    };
}

/**
 * Get all job applications (admin)
 */
export async function getAllJobApplications(
    page: number = 1,
    limit: number = 10,
): Promise<{
    success: boolean;
    data?: PaginatedResponse<JobApplication>;
    error?: string;
}> {
    const result = await handleRequest<PaginatedResponse<JobApplication>>(
        'GET',
        `/job-applications?page=${page}&limit=${limit}`,
        undefined,
        true,
    );

    if (result.error) {
        return {
            success: false,
            error: result.error.message,
        };
    }

    return {
        success: true,
        data: result.data,
    };
}

/**
 * Get a single job application by ID
 */
export async function getJobApplicationById(applicationId: string): Promise<{
    success: boolean;
    data?: JobApplication;
    error?: string;
}> {
    const result = await handleRequest<JobApplication>(
        'GET',
        `/job-applications/${applicationId}`,
        undefined,
        true,
    );

    if (result.error) {
        return {
            success: false,
            error: result.error.message,
        };
    }

    return {
        success: true,
        data: result.data,
    };
}

/**
 * Create a new job application
 */
export async function createJobApplication(
    data: CreateJobApplicationDto,
): Promise<{
    success: boolean;
    data?: JobApplication;
    error?: string;
}> {
    const result = await handleRequest<JobApplication>(
        'POST',
        '/job-applications',
        data,
        true,
    );

    if (result.error) {
        return {
            success: false,
            error: result.error.message,
        };
    }

    return {
        success: true,
        data: result.data,
    };
}

/**
 * Update a job application
 */
export async function updateJobApplication(
    applicationId: string,
    data: UpdateJobApplicationDto,
): Promise<{
    success: boolean;
    data?: JobApplication;
    error?: string;
}> {
    const result = await handleRequest<JobApplication>(
        'PATCH',
        `/job-applications/${applicationId}`,
        data,
        true,
    );

    if (result.error) {
        return {
            success: false,
            error: result.error.message,
        };
    }

    return {
        success: true,
        data: result.data,
    };
}

/**
 * Delete a job application
 */
export async function deleteJobApplication(applicationId: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
}> {
    const result = await handleRequest<{ message: string }>(
        'DELETE',
        `/job-applications/${applicationId}`,
        undefined,
        true,
    );

    if (result.error) {
        return {
            success: false,
            error: result.error.message,
        };
    }

    return {
        success: true,
        message: result.data?.message || 'Job application deleted successfully',
    };
}

/**
 * Get job application statistics
 */
export async function getJobApplicationStats(userId?: string): Promise<{
    success: boolean;
    data?: JobApplicationStats;
    error?: string;
}> {
    const endpoint = userId
        ? `/job-applications/stats/global?userId=${userId}`
        : '/job-applications/stats/global';

    const result = await handleRequest<JobApplicationStats>(
        'GET',
        endpoint,
        undefined,
        true,
    );

    if (result.error) {
        return {
            success: false,
            error: result.error.message,
        };
    }

    return {
        success: true,
        data: result.data,
    };
}

/**
 * Get job applications by job ID
 */
export async function getJobApplicationsByJobId(
    jobId: string,
    page: number = 1,
    limit: number = 10,
): Promise<{
    success: boolean;
    data?: PaginatedResponse<JobApplication>;
    error?: string;
}> {
    const result = await handleRequest<PaginatedResponse<JobApplication>>(
        'GET',
        `/job-applications/job/${jobId}?page=${page}&limit=${limit}`,
        undefined,
        true,
    );

    if (result.error) {
        return {
            success: false,
            error: result.error.message,
        };
    }

    return {
        success: true,
        data: result.data,
    };
}
