'use server';

import { handleRequest } from '@/lib/server-request';
import { type Cv, type CvSection, type CvSuggestion } from '@/lib/api/cv-api';

/**
 * Get all CVs for current user
 */
export async function getAllCvs(): Promise<{
    success: boolean;
    data?: Cv[];
    error?: string;
}> {
    const result = await handleRequest<Cv[]>('GET', '/cv', undefined, true);

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
 * Get single CV by ID
 */
export async function getCvById(id: string): Promise<{
    success: boolean;
    data?: Cv;
    error?: string;
}> {
    const result = await handleRequest<Cv>('GET', `/cv/${id}`, undefined, true);

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
 * Create new CV
 */
export async function createCv(data: {
    title: string;
    userName?: string;
    data?: any;
}): Promise<{
    success: boolean;
    data?: Cv;
    error?: string;
}> {
    const result = await handleRequest<Cv>('POST', '/cv', data, true);

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
 * Update CV
 */
export async function updateCv(
    id: string,
    data: {
        title?: string;
        userName?: string;
        data?: any;
    },
): Promise<{
    success: boolean;
    data?: Cv;
    error?: string;
}> {
    const result = await handleRequest<Cv>('PUT', `/cv/${id}`, data, true);

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
 * Update CV metadata
 */
export async function updateCvMetadata(
    id: string,
    metadata: {
        aiScore?: number;
        lastReviewedAt?: Date;
        templateId?: string;
        customStyles?: any;
    },
): Promise<{
    success: boolean;
    data?: Cv;
    error?: string;
}> {
    const result = await handleRequest<Cv>(
        'PUT',
        `/cv/${id}/metadata`,
        metadata,
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
 * Delete CV
 */
export async function deleteCv(id: string): Promise<{
    success: boolean;
    error?: string;
}> {
    const result = await handleRequest<void>(
        'DELETE',
        `/cv/${id}`,
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
    };
}

/**
 * Get CV sections
 */
export async function getCvSections(cvId: string): Promise<{
    success: boolean;
    data?: CvSection[];
    error?: string;
}> {
    const result = await handleRequest<CvSection[]>(
        'GET',
        `/cv/${cvId}/sections`,
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
 * Create CV section
 */
export async function createCvSection(
    cvId: string,
    data: {
        type: string;
        title: string;
        content: any;
        order: number;
    },
): Promise<{
    success: boolean;
    data?: CvSection;
    error?: string;
}> {
    const result = await handleRequest<CvSection>(
        'POST',
        `/cv/${cvId}/sections`,
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
 * Update CV section
 */
export async function updateCvSection(
    sectionId: string,
    data: {
        type?: string;
        title?: string;
        content?: any;
        order?: number;
    },
): Promise<{
    success: boolean;
    data?: CvSection;
    error?: string;
}> {
    const result = await handleRequest<CvSection>(
        'PUT',
        `/cv/sections/${sectionId}`,
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
 * Delete CV section
 */
export async function deleteCvSection(sectionId: string): Promise<{
    success: boolean;
    error?: string;
}> {
    const result = await handleRequest<void>(
        'DELETE',
        `/cv/sections/${sectionId}`,
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
    };
}

/**
 * Reorder CV sections
 */
export async function reorderCvSections(
    cvId: string,
    sectionIds: string[],
): Promise<{
    success: boolean;
    data?: CvSection[];
    error?: string;
}> {
    const result = await handleRequest<CvSection[]>(
        'PUT',
        `/cv/${cvId}/sections/reorder`,
        { sectionIds },
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
 * Get CV suggestions
 */
export async function getCvSuggestions(cvId: string): Promise<{
    success: boolean;
    data?: CvSuggestion[];
    error?: string;
}> {
    const result = await handleRequest<CvSuggestion[]>(
        'GET',
        `/cv/${cvId}/suggestions`,
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
 * Create CV suggestion
 */
export async function createCvSuggestion(
    cvId: string,
    data: {
        sectionId?: string;
        type: string;
        original: any;
        suggested: any;
        reason?: string;
    },
): Promise<{
    success: boolean;
    data?: CvSuggestion;
    error?: string;
}> {
    const result = await handleRequest<CvSuggestion>(
        'POST',
        `/cv/${cvId}/suggestions`,
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
 * Update CV suggestion (accept/reject)
 */
export async function updateCvSuggestion(
    suggestionId: string,
    status: 'pending' | 'accepted' | 'rejected',
): Promise<{
    success: boolean;
    data?: CvSuggestion;
    error?: string;
}> {
    const result = await handleRequest<CvSuggestion>(
        'PUT',
        `/cv/suggestions/${suggestionId}`,
        { status },
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
 * Delete CV suggestion
 */
export async function deleteCvSuggestion(suggestionId: string): Promise<{
    success: boolean;
    error?: string;
}> {
    const result = await handleRequest<void>(
        'DELETE',
        `/cv/suggestions/${suggestionId}`,
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
    };
}

/**
 * Review CV with AI
 */
export async function reviewCv(
    cvId: string,
    options?: {
        temperature?: number;
        maxTokens?: number;
        multilingual?: boolean;
    },
): Promise<{
    success: boolean;
    data?: string;
    error?: string;
}> {
    const result = await handleRequest<string>(
        'POST',
        `/cv/${cvId}/review`,
        options || {},
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
 * Rewrite CV with AI and create suggestions
 */
export async function rewriteCv(
    cvId: string,
    options?: {
        temperature?: number;
        maxTokens?: number;
    },
): Promise<{
    success: boolean;
    data?: { result: string; suggestionsCreated: number };
    error?: string;
}> {
    const result = await handleRequest<{
        result: string;
        suggestionsCreated: number;
    }>('POST', `/cv/${cvId}/rewrite`, options || {}, true);

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
