'use server';

import { auth } from '@/auth';
import { handleRequest } from '@/lib/server-request';

/**
 * Resume Server Actions
 * All resume-related server actions for the frontend
 *
 * ARCHITECTURE: Frontend -> Server Actions -> Backend API (NestJS) -> Gradio (Python)
 * This follows best practices: Gradio on backend for security and scalability
 */

// ============================================================================
// TYPES
// ============================================================================

export interface Resume {
    id: string;
    userId: string;
    userName: string;
    title: string;
    status: string;
    data: any;
    filePath?: string;
    fileName?: string;
    mimeType?: string;
    fileSize?: number;
    aiScore?: number;
    lastReviewedAt?: Date;
    templateId?: string;
    customStyles?: any;
    careerAdvice?: any;
    createdAt: Date;
    updatedAt: Date;
    sections?: ResumeSection[];
    suggestions?: ResumeSuggestion[];
}

export interface ResumeSection {
    id: string;
    resumeId: string;
    type: string;
    title: string;
    content: any;
    order: number;
    aiScore?: number;
    createdAt: Date;
    updatedAt: Date;
    suggestions?: ResumeSuggestion[];
}

export interface ResumeSuggestion {
    id: string;
    resumeId?: string;
    sectionId?: string;
    type: string;
    original: any;
    suggested: any;
    reason: string;
    status: string;
    appliedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// ============================================================================
// RESUME CRUD
// ============================================================================

export async function getAllResumes(): Promise<{
    success: boolean;
    data?: Resume[];
    error?: string;
}> {
    const result = await handleRequest<Resume[]>(
        'GET',
        '/resume',
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

export async function getResume(id: string): Promise<{
    success: boolean;
    data?: Resume;
    error?: string;
}> {
    const result = await handleRequest<Resume>(
        'GET',
        `/resume/${id}`,
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

export async function createResume(data: {
    title?: string;
    data?: any;
}): Promise<{
    success: boolean;
    data?: Resume;
    error?: string;
}> {
    const result = await handleRequest<Resume>('POST', '/resume', data, true);

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

export async function updateResume(
    id: string,
    data: { title?: string; data?: any },
): Promise<{
    success: boolean;
    data?: Resume;
    error?: string;
}> {
    const result = await handleRequest<Resume>(
        'PUT',
        `/resume/${id}`,
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

export async function deleteResume(id: string): Promise<{
    success: boolean;
    error?: string;
}> {
    const result = await handleRequest(
        'DELETE',
        `/resume/${id}`,
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

// ============================================================================
// FILE UPLOAD
// ============================================================================

export async function uploadResumeFile(
    id: string,
    file: File,
): Promise<{
    success: boolean;
    data?: Resume;
    error?: string;
}> {
    const formData = new FormData();
    formData.append('file', file);

    const result = await handleRequest<Resume>(
        'POST',
        `/resume/${id}/upload`,
        formData,
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

// ============================================================================
// AI PARSING
// ============================================================================

export async function parseResumeWithGemini(
    file: File,
    maxUploadMb?: number,
): Promise<{
    success: boolean;
    data?: { display: string; json: any };
    error?: string;
}> {
    const formData = new FormData();
    formData.append('file', file);
    if (maxUploadMb) formData.append('maxUploadMb', maxUploadMb.toString());

    const result = await handleRequest<{ display: string; json: any }>(
        'POST',
        '/resume/parse/gemini',
        formData,
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

export async function parseResumeWithQwen(
    file: File,
    options?: {
        llmHost?: string;
        qwenModel?: string;
        maxUploadMb?: number;
    },
): Promise<{
    success: boolean;
    data?: { display: string; json: any };
    error?: string;
}> {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.llmHost) formData.append('llmHost', options.llmHost);
    if (options?.qwenModel) formData.append('qwenModel', options.qwenModel);
    if (options?.maxUploadMb)
        formData.append('maxUploadMb', options.maxUploadMb.toString());

    const result = await handleRequest<{ display: string; json: any }>(
        'POST',
        '/resume/parse/qwen',
        formData,
        true,
        true, // isFormData
        300000, // 5 minute timeout for CV processing
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

// ============================================================================
// AI REVIEW
// ============================================================================

export async function reviewResume(
    id: string,
    options?: { temperature?: number; maxTokens?: number },
): Promise<{
    success: boolean;
    data?: { review: string };
    error?: string;
}> {
    const result = await handleRequest<{ review: string }>(
        'POST',
        `/resume/${id}/review`,
        options || {},
        true,
        false,
        300000, // 5 minute timeout
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

export async function downloadReviewPdf(id: string): Promise<Blob> {
    const session = await auth();
    if (!session?.user?.accessToken) {
        throw new Error('No authentication token found. Please log in first.');
    }

    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/resume/${id}/review/pdf`,
        {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${session.user.accessToken}`,
            },
        },
    );

    if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(
            `Failed to download PDF: ${response.status} ${response.statusText} - ${errorText}`,
        );
    }

    return await response.blob();
}

export async function reviewResumeMultilingual(
    id: string,
    options?: { temperature?: number; maxTokens?: number },
): Promise<{
    success: boolean;
    data?: { review: string };
    error?: string;
}> {
    const result = await handleRequest<{ review: string }>(
        'POST',
        `/resume/${id}/review-multilingual`,
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

// ============================================================================
// AI REWRITING
// ============================================================================

export async function rewriteResume(
    id: string,
    options?: { temperature?: number; maxTokens?: number },
): Promise<{
    success: boolean;
    data?: { rewritten: any };
    error?: string;
}> {
    const result = await handleRequest<{ rewritten: any }>(
        'POST',
        `/resume/${id}/rewrite`,
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

// ============================================================================
// CAREER ADVISOR
// ============================================================================

export async function getCareerAdvice(
    id: string,
    options: {
        desiredPaths: string[];
        intentions: string;
        temperature?: number;
        maxTokens?: number;
    },
): Promise<{
    success: boolean;
    data?: { advice: any };
    error?: string;
}> {
    const result = await handleRequest<{ advice: any }>(
        'POST',
        `/resume/${id}/career-advice`,
        options,
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

export async function applyCareerFeedback(
    id: string,
    options: {
        originalOutput: string;
        stepIdentifier: string;
        feedback: any;
        temperature?: number;
        maxTokens?: number;
    },
): Promise<{
    success: boolean;
    data?: { updated: any };
    error?: string;
}> {
    const result = await handleRequest<{ updated: any }>(
        'POST',
        `/resume/${id}/career-advice/feedback`,
        options,
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

// ============================================================================
// SECTION MANAGEMENT
// ============================================================================

export async function getResumeSections(resumeId: string): Promise<{
    success: boolean;
    data?: ResumeSection[];
    error?: string;
}> {
    const result = await handleRequest<ResumeSection[]>(
        'GET',
        `/resume/${resumeId}/sections`,
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

export async function createResumeSection(
    resumeId: string,
    section: {
        type: string;
        title: string;
        content: any;
        order?: number;
    },
): Promise<{
    success: boolean;
    data?: ResumeSection;
    error?: string;
}> {
    const result = await handleRequest<ResumeSection>(
        'POST',
        `/resume/${resumeId}/sections`,
        section,
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

export async function updateResumeSection(
    sectionId: string,
    updates: {
        type?: string;
        title?: string;
        content?: any;
        order?: number;
    },
): Promise<{
    success: boolean;
    data?: ResumeSection;
    error?: string;
}> {
    const result = await handleRequest<ResumeSection>(
        'PUT',
        `/resume/sections/${sectionId}`,
        updates,
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

export async function deleteResumeSection(sectionId: string): Promise<{
    success: boolean;
    error?: string;
}> {
    const result = await handleRequest(
        'DELETE',
        `/resume/sections/${sectionId}`,
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

export async function reorderResumeSections(
    resumeId: string,
    sectionOrders: { id: string; order: number }[],
): Promise<{
    success: boolean;
    data?: ResumeSection[];
    error?: string;
}> {
    const result = await handleRequest<ResumeSection[]>(
        'PUT',
        `/resume/${resumeId}/sections/reorder`,
        { sectionOrders },
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

// ============================================================================
// SUGGESTION MANAGEMENT
// ============================================================================

export async function getResumeSuggestions(
    resumeId: string,
    filters?: { status?: string; sectionId?: string },
): Promise<{
    success: boolean;
    data?: ResumeSuggestion[];
    error?: string;
}> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.sectionId) params.set('sectionId', filters.sectionId);

    const result = await handleRequest<ResumeSuggestion[]>(
        'GET',
        `/resume/${resumeId}/suggestions?${params.toString()}`,
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

export async function createResumeSuggestion(
    resumeId: string,
    suggestion: {
        sectionId?: string;
        type: string;
        original: any;
        suggested: any;
        reason?: string;
    },
): Promise<{
    success: boolean;
    data?: ResumeSuggestion;
    error?: string;
}> {
    const result = await handleRequest<ResumeSuggestion>(
        'POST',
        `/resume/${resumeId}/suggestions`,
        suggestion,
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

export async function updateResumeSuggestion(
    suggestionId: string,
    status: 'pending' | 'accepted' | 'rejected',
): Promise<{
    success: boolean;
    data?: ResumeSuggestion;
    error?: string;
}> {
    const result = await handleRequest<ResumeSuggestion>(
        'PUT',
        `/resume/suggestions/${suggestionId}`,
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

export async function deleteResumeSuggestion(suggestionId: string): Promise<{
    success: boolean;
    error?: string;
}> {
    const result = await handleRequest(
        'DELETE',
        `/resume/suggestions/${suggestionId}`,
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

// ============================================================================
// RESUME SHARING
// ============================================================================

export async function generateResumeShareLink(
    id: string,
    options?: { expiry?: Date },
): Promise<{
    success: boolean;
    data?: {
        shareUrl: string;
        shareSlug: string;
        isPublic: boolean;
        shareExpiry?: Date;
    };
    error?: string;
}> {
    const result = await handleRequest<{
        shareUrl: string;
        shareSlug: string;
        isPublic: boolean;
        shareExpiry?: Date;
    }>('POST', `/resume/${id}/share`, options || {}, true);

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

export async function revokeResumeShareLink(id: string): Promise<{
    success: boolean;
    error?: string;
}> {
    const result = await handleRequest(
        'DELETE',
        `/resume/${id}/share`,
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

export async function getResumeShareStats(id: string): Promise<{
    success: boolean;
    data?: {
        shareSlug: string | null;
        isPublic: boolean;
        shareViews: number;
        shareExpiry: Date | null;
        lastViewedAt: Date | null;
    };
    error?: string;
}> {
    const result = await handleRequest<{
        shareSlug: string | null;
        isPublic: boolean;
        shareViews: number;
        shareExpiry: Date | null;
        lastViewedAt: Date | null;
    }>('GET', `/resume/${id}/share/stats`, undefined, true);

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

export async function getSharedResume(slug: string): Promise<{
    success: boolean;
    data?: Resume;
    error?: string;
}> {
    const result = await handleRequest<Resume>(
        'GET',
        `/resume/share/${slug}`,
        undefined,
        false, // No auth required for public shares
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
