'use server';

import { handleRequest } from '@/lib/server-request';
import { CreateJobDto, Job, UpdateJobDto } from '@/types/job.types';

/**
 * Get user CV data
 */
export async function getUserCV(userId: string): Promise<{
    success: boolean;
    data?: any;
    error?: string;
}> {
    const result = await handleRequest<any>(
        'GET',
        `/users/${userId}/cv`,
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
 * Match CV with job requirements using AI
 */
export async function matchCVWithJob(
    cvData: any,
    jobTitle: string,
    jobRequirements: string,
    jobDescription: string,
    githubUrl?: string,
    linkedinUrl?: string,
): Promise<{
    success: boolean;
    data?: any;
    error?: string;
}> {
    const result = await handleRequest<any>(
        'POST',
        '/resume/match-job',
        {
            resumeData: cvData,
            jobTitle,
            jobRequirements,
            jobDescription,
            githubUrl,
            linkedinUrl,
        },
        true, // requires auth
        false,
        300000, // 5 minutes timeout
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

/**
 * Add job to vector database
 */
export async function addJobToDatabase(jobData: any): Promise<{
    success: boolean;
    message?: string;
    error?: string;
}> {
    const result = await handleRequest<any>('POST', '/jobs/database/add', jobData, true);

    if (result.error) {
        return {
            success: false,
            error: result.error.message,
        };
    }

    return {
        success: true,
        message: result.data,
    };
}

/**
 * Match CV with jobs in vector database
 */
export async function matchCVWithJobsDatabase(cvText: string, nResults: number = 5): Promise<{
    success: boolean;
    data?: any;
    error?: string;
}> {
    const result = await handleRequest<any>(
        'POST',
        '/jobs/database/match-cv',
        { cvText, nResults },
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
 * Get all jobs from vector database
 */
export async function getAllJobsFromDatabase(): Promise<{
    success: boolean;
    data?: any;
    error?: string;
}> {
    const result = await handleRequest<any>('GET', '/jobs/database/all', undefined, true);

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
 * Delete job from vector database
 */
export async function deleteJobFromDatabase(jobId: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
}> {
    const result = await handleRequest<any>('DELETE', `/jobs/database/${jobId}`, undefined, true);

    if (result.error) {
        return {
            success: false,
            error: result.error.message,
        };
    }

    return {
        success: true,
        message: result.data,
    };
}
