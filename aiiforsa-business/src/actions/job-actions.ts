'use server';

import { handleRequest } from '@/lib/server-request';
import { CreateJobDto, Job, UpdateJobDto } from '@/types/job.types';

/**
 * Get all jobs
 */
export async function getAllJobs(): Promise<{
    success: boolean;
    data?: Job[];
    error?: string;
}> {
    const result = await handleRequest<Job[]>('GET', '/jobs', undefined, true);

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
 * Get a single job by ID
 */
export async function getJobById(jobId: number): Promise<{
    success: boolean;
    data?: Job;
    error?: string;
}> {
    const result = await handleRequest<Job>(
        'GET',
        `/jobs/${jobId}`,
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
 * Create a new job
 */
export async function createJob(data: CreateJobDto): Promise<{
    success: boolean;
    data?: Job;
    error?: string;
}> {
    const result = await handleRequest<Job>('POST', '/jobs', data, true);

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
 * Update a job
 */
export async function updateJob(
    jobId: number,
    data: UpdateJobDto,
): Promise<{
    success: boolean;
    data?: Job;
    error?: string;
}> {
    const result = await handleRequest<Job>(
        'PATCH',
        `/jobs/${jobId}`,
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
 * Delete a job
 */
export async function deleteJob(jobId: number): Promise<{
    success: boolean;
    message?: string;
    error?: string;
}> {
    const result = await handleRequest<{ message: string }>(
        'DELETE',
        `/jobs/${jobId}`,
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
        message: result.data?.message || 'Job deleted successfully',
    };
}
