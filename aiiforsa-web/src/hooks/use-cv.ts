/**
 * CV Hooks
 * React hooks for CV management with SWR caching and server actions
 */

'use client';

import useSWR, { mutate } from 'swr';
import { type Cv, type CvSection, type CvSuggestion } from '@/lib/api/cv-api';
import {
    getAllCvs,
    getCvById,
    getCvSections,
    getCvSuggestions,
    createCv as createCvAction,
    updateCv as updateCvAction,
    updateCvMetadata as updateCvMetadataAction,
    deleteCv as deleteCvAction,
    createCvSection as createCvSectionAction,
    updateCvSection as updateCvSectionAction,
    deleteCvSection as deleteCvSectionAction,
    reorderCvSections as reorderCvSectionsAction,
    createCvSuggestion as createCvSuggestionAction,
    updateCvSuggestion as updateCvSuggestionAction,
    deleteCvSuggestion as deleteCvSuggestionAction,
    reviewCv as reviewCvAction,
    rewriteCv as rewriteCvAction,
} from '@/actions';
import { useCallback } from 'react';

// Get all CVs for current user
export function useCvs() {
    const { data, error, isLoading } = useSWR<Cv[]>('/cv', async () => {
        const result = await getAllCvs();
        if (!result.success) throw new Error(result.error);
        return result.data!;
    });

    return {
        cvs: data,
        isLoading,
        isError: error,
        mutate: () => mutate('/cv'),
    };
}

// Get single CV by ID
export function useCv(id: string | null) {
    const { data, error, isLoading } = useSWR<Cv>(
        id ? `/cv/${id}` : null,
        async () => {
            const result = await getCvById(id!);
            if (!result.success) throw new Error(result.error);
            return result.data!;
        },
    );

    return {
        cv: data,
        isLoading,
        isError: error,
        mutate: () => mutate(`/cv/${id}`),
    };
}

// Get sections for a CV
export function useCvSections(cvId: string | null) {
    const { data, error, isLoading } = useSWR<CvSection[]>(
        cvId ? `/cv/${cvId}/sections` : null,
        async () => {
            const result = await getCvSections(cvId!);
            if (!result.success) throw new Error(result.error);
            return result.data!;
        },
    );

    return {
        sections: data,
        isLoading,
        isError: error,
        mutate: () => mutate(`/cv/${cvId}/sections`),
    };
}

// Get suggestions for a CV
export function useCvSuggestions(cvId: string | null) {
    const { data, error, isLoading } = useSWR<CvSuggestion[]>(
        cvId ? `/cv/${cvId}/suggestions` : null,
        async () => {
            const result = await getCvSuggestions(cvId!);
            if (!result.success) throw new Error(result.error);
            return result.data!;
        },
    );

    const pendingSuggestions = data?.filter(s => s.status === 'pending') || [];
    const acceptedSuggestions =
        data?.filter(s => s.status === 'accepted') || [];
    const rejectedSuggestions =
        data?.filter(s => s.status === 'rejected') || [];

    return {
        suggestions: data,
        pendingSuggestions,
        acceptedSuggestions,
        rejectedSuggestions,
        isLoading,
        isError: error,
        mutate: () => mutate(`/cv/${cvId}/suggestions`),
    };
}

// CV mutation actions
export function useCvActions() {
    const createCv = useCallback(
        async (data: { title: string; userName?: string; data?: any }) => {
            const result = await createCvAction(data);
            if (!result.success) throw new Error(result.error);
            mutate('/cv');
            return result.data!;
        },
        [],
    );

    const updateCv = useCallback(
        async (
            id: string,
            data: { title?: string; userName?: string; data?: any },
        ) => {
            const result = await updateCvAction(id, data);
            if (!result.success) throw new Error(result.error);
            mutate(`/cv/${id}`);
            mutate('/cv');
            return result.data!;
        },
        [],
    );

    const updateCvMetadata = useCallback(
        async (
            id: string,
            metadata: {
                aiScore?: number;
                lastReviewedAt?: Date;
                templateId?: string;
                customStyles?: any;
            },
        ) => {
            const result = await updateCvMetadataAction(id, metadata);
            if (!result.success) throw new Error(result.error);
            mutate(`/cv/${id}`);
            mutate('/cv');
            return result.data!;
        },
        [],
    );

    const deleteCv = useCallback(async (id: string) => {
        const result = await deleteCvAction(id);
        if (!result.success) throw new Error(result.error);
        mutate('/cv');
    }, []);

    return {
        createCv,
        updateCv,
        updateCvMetadata,
        deleteCv,
    };
}

// Section mutation actions
export function useSectionActions(cvId: string) {
    const createSection = useCallback(
        async (data: {
            type: any;
            title: string;
            content: any;
            order: number;
        }) => {
            const result = await createCvSectionAction(cvId, data);
            if (!result.success) throw new Error(result.error);
            mutate(`/cv/${cvId}/sections`);
            mutate(`/cv/${cvId}`);
            return result.data!;
        },
        [cvId],
    );

    const updateSection = useCallback(
        async (
            sectionId: string,
            data: {
                type?: any;
                title?: string;
                content?: any;
                order?: number;
            },
        ) => {
            const result = await updateCvSectionAction(sectionId, data);
            if (!result.success) throw new Error(result.error);
            mutate(`/cv/${cvId}/sections`);
            mutate(`/cv/${cvId}`);
            return result.data!;
        },
        [cvId],
    );

    const deleteSection = useCallback(
        async (sectionId: string) => {
            const result = await deleteCvSectionAction(sectionId);
            if (!result.success) throw new Error(result.error);
            mutate(`/cv/${cvId}/sections`);
            mutate(`/cv/${cvId}`);
        },
        [cvId],
    );

    const reorderSections = useCallback(
        async (sectionIds: string[]) => {
            const result = await reorderCvSectionsAction(cvId, sectionIds);
            if (!result.success) throw new Error(result.error);
            mutate(`/cv/${cvId}/sections`);
            mutate(`/cv/${cvId}`);
            return result.data!;
        },
        [cvId],
    );

    return {
        createSection,
        updateSection,
        deleteSection,
        reorderSections,
    };
}

// Suggestion mutation actions
export function useSuggestionActions(cvId: string) {
    const createSuggestion = useCallback(
        async (data: {
            sectionId?: string;
            type: string;
            original: any;
            suggested: any;
            reason?: string;
        }) => {
            const result = await createCvSuggestionAction(cvId, data);
            if (!result.success) throw new Error(result.error);
            mutate(`/cv/${cvId}/suggestions`);
            return result.data!;
        },
        [cvId],
    );

    const acceptSuggestion = useCallback(
        async (suggestionId: string) => {
            const result = await updateCvSuggestionAction(
                suggestionId,
                'accepted',
            );
            if (!result.success) throw new Error(result.error);
            mutate(`/cv/${cvId}/suggestions`);
            mutate(`/cv/${cvId}/sections`);
            mutate(`/cv/${cvId}`);
            return result.data!;
        },
        [cvId],
    );

    const rejectSuggestion = useCallback(
        async (suggestionId: string) => {
            const result = await updateCvSuggestionAction(
                suggestionId,
                'rejected',
            );
            if (!result.success) throw new Error(result.error);
            mutate(`/cv/${cvId}/suggestions`);
            return result.data!;
        },
        [cvId],
    );

    const deleteSuggestion = useCallback(
        async (suggestionId: string) => {
            const result = await deleteCvSuggestionAction(suggestionId);
            if (!result.success) throw new Error(result.error);
            mutate(`/cv/${cvId}/suggestions`);
        },
        [cvId],
    );

    return {
        createSuggestion,
        acceptSuggestion,
        rejectSuggestion,
        deleteSuggestion,
    };
}

// AI operations hooks
export function useCvAiActions(cvId: string) {
    const reviewCv = useCallback(
        async (options?: {
            temperature?: number;
            maxTokens?: number;
            multilingual?: boolean;
        }) => {
            const result = await reviewCvAction(cvId, options);
            if (!result.success) throw new Error(result.error);
            mutate(`/cv/${cvId}`);
            return result.data!;
        },
        [cvId],
    );

    const rewriteCv = useCallback(
        async (options?: { temperature?: number; maxTokens?: number }) => {
            const result = await rewriteCvAction(cvId, options);
            if (!result.success) throw new Error(result.error);
            mutate(`/cv/${cvId}/suggestions`);
            mutate(`/cv/${cvId}`);
            return result.data!;
        },
        [cvId],
    );

    return {
        reviewCv,
        rewriteCv,
    };
}
