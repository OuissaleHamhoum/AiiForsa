/**
 * CV API Types
 * Types for CV (Curriculum Vitae) management
 */

// CV Section Types
export type CvSectionType =
    | 'profile'
    | 'summary'
    | 'experience'
    | 'education'
    | 'skills'
    | 'certifications'
    | 'courses'
    | 'projects'
    | 'languages'
    | 'awards'
    | 'publications'
    | 'volunteer'
    | 'references'
    | 'links'
    | 'custom';

// CV Suggestion Status
export type CvSuggestionStatus = 'pending' | 'accepted' | 'rejected';

// CV Section Interface
export interface CvSection {
    id: string;
    type: CvSectionType;
    title?: string;
    content: any;
    order: number;
    createdAt: string;
    updatedAt: string;
}

// CV Suggestion Interface
export interface CvSuggestion {
    id: string;
    sectionId: string;
    content: any;
    status: CvSuggestionStatus;
    createdAt: string;
    updatedAt: string;
}

// CV Interface
export interface Cv {
    id: string;
    title: string;
    userId: string;
    sections: CvSection[];
    suggestions: CvSuggestion[];
    createdAt: string;
    updatedAt: string;
}
