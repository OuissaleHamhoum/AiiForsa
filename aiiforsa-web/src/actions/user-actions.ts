'use server';

import { handleRequest } from '@/lib/server-request';

/**
 * User Profile Server Actions
 * Secure server-side API calls for user profile operations
 */

export interface UserProfile {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
    coverImage?: string;
    bio?: string;
    location?: string;
    phone?: string;
    website?: string;
    linkedin?: string;
    github?: string;
    createdAt: Date;
    updatedAt: Date;
}

// ============================================================================
// COMPLETE USER PROFILE WITH CV DATA
// ============================================================================

export interface UserWorkExperience {
    id: string;
    jobTitle: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    description?: string;
    order?: number;
}

export interface UserEducation {
    id: string;
    degree: string;
    fieldOfStudy?: string;
    institution: string;
    location?: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    gpa?: string;
    description?: string;
    order?: number;
}

export interface UserSkill {
    id: string;
    name: string;
    level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    yearsExperience?: number;
    category?: string;
    endorsed: boolean;
    order?: number;
}

export interface UserCertification {
    id: string;
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
    credentialUrl?: string;
    description?: string;
    order?: number;
}

export interface UserProject {
    id: string;
    name: string;
    description?: string;
    role?: string;
    startDate?: string;
    endDate?: string;
    isCurrent: boolean;
    url?: string;
    technologies?: string;
    highlights?: string;
    order?: number;
}

export interface UserLanguage {
    id: string;
    language: string;
    proficiency:
        | 'ELEMENTARY'
        | 'LIMITED_WORKING'
        | 'PROFESSIONAL_WORKING'
        | 'FULL_PROFESSIONAL'
        | 'NATIVE';
    order?: number;
}

export interface UserSocialLink {
    id: string;
    type: 'LINKEDIN' | 'GITHUB' | 'TWITTER' | 'WEBSITE' | 'PORTFOLIO' | 'OTHER';
    url: string;
    label?: string;
    isPrimary: boolean;
    order?: number;
}

export interface UserAward {
    id: string;
    title: string;
    issuer: string;
    date: string;
    description?: string;
    order?: number;
}

export interface UserPublication {
    id: string;
    title: string;
    publisher?: string;
    publicationDate: string;
    url?: string;
    description?: string;
    authors?: string;
    order?: number;
}

export interface UserVolunteerWork {
    id: string;
    role: string;
    organization: string;
    startDate?: string;
    endDate?: string;
    isCurrent: boolean;
    description?: string;
    order?: number;
}

export interface UserReference {
    id: string;
    name: string;
    position: string;
    company: string;
    email?: string;
    phone?: string;
    relationship?: string;
    description?: string;
    order?: number;
}

export interface CompleteUserProfile {
    id: string;
    email: string;
    name?: string;
    phone?: string;
    gender?: string;
    birthDate?: string;
    timezone?: string;
    preferredLanguage?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    profileImage?: string;
    bannerImage?: string;
    bio?: string;
    headline?: string;
    currentPosition?: string;
    currentCompany?: string;
    industry?: string;
    experienceLevel?: string;
    yearsExperience?: number;
    professionalSummary?: string;
    createdAt: string;
    updatedAt: string;
    // Parsed CV data from uploaded resume
    cvParsed?: any;
    parsedCV?: any; // Alias for cvParsed
    // CV Data relationships
    skills: UserSkill[];
    workExperiences: UserWorkExperience[];
    educations: UserEducation[];
    certifications: UserCertification[];
    projects: UserProject[];
    languages: UserLanguage[];
    socialLinks: UserSocialLink[];
    awards: UserAward[];
    publications: UserPublication[];
    volunteerWork: UserVolunteerWork[];
    references: UserReference[];
}

export async function getUserCompleteProfile(userId: string): Promise<{
    success: boolean;
    data?: CompleteUserProfile;
    error?: string;
}> {
    const result = await handleRequest<CompleteUserProfile>(
        'GET',
        `/users/${userId}/profile`,
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

// ============================================================================
// USER PROFILE
// ============================================================================

export async function getCurrentUser(): Promise<{
    success: boolean;
    data?: UserProfile;
    error?: string;
}> {
    const result = await handleRequest<UserProfile>(
        'GET',
        '/users/me',
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

export async function updateUserProfile(
    userId: string,
    data: Partial<UserProfile>,
): Promise<{
    success: boolean;
    data?: UserProfile;
    error?: string;
}> {
    const result = await handleRequest<UserProfile>(
        'PATCH',
        `/users/${userId}`,
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

// ============================================================================
// AVATAR & COVER IMAGE
// ============================================================================

export async function uploadAvatar(
    userId: string,
    file: File,
): Promise<{
    success: boolean;
    data?: { avatarUrl: string };
    error?: string;
}> {
    const formData = new FormData();
    formData.append('file', file);

    const result = await handleRequest<{ avatarUrl: string }>(
        'POST',
        `/users/${userId}/avatar`,
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

export async function uploadCoverImage(
    userId: string,
    file: File,
): Promise<{
    success: boolean;
    data?: { coverUrl: string };
    error?: string;
}> {
    const formData = new FormData();
    formData.append('file', file);

    const result = await handleRequest<{ coverUrl: string }>(
        'POST',
        `/users/${userId}/cover`,
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
// CV UPLOAD & PARSING
// ============================================================================

export interface UpdateUserProfileData {
    name?: string;
    phone?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
    birthDate?: string;
    timezone?: string;
    preferredLanguage?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    profileImage?: string;
    bannerImage?: string;
    bio?: string;
    headline?: string;
    currentPosition?: string;
    currentCompany?: string;
    industry?: string;
    experienceLevel?:
        | 'ENTRY'
        | 'JUNIOR'
        | 'MID'
        | 'SENIOR'
        | 'LEAD'
        | 'EXECUTIVE';
    yearsExperience?: number;
    professionalSummary?: string;
    desiredSalaryMin?: number;
    desiredSalaryMax?: number;
    salaryCurrency?: string;
    theme?: 'LIGHT' | 'DARK' | 'SYSTEM';
    profileVisibility?: 'PUBLIC' | 'PRIVATE' | 'CONNECTIONS_ONLY';
    showEmail?: boolean;
    showPhone?: boolean;
    allowMessages?: boolean;
}

export async function uploadAndParseCV(file: File): Promise<{
    success: boolean;
    data?: {
        id: string;
        email: string;
        name: string;
        cvParsed: any;
    };
    parsedCV?: any;
    message?: string;
    error?: string;
}> {
    const formData = new FormData();
    formData.append('cv', file);

    // Use 5 minute timeout for CV upload (includes virus scanning and AI parsing)
    const result = await handleRequest<{
        success: boolean;
        message: string;
        data: {
            id: string;
            email: string;
            name: string;
            cvParsed: any;
        };
        parsedCV: any;
    }>('POST', '/users/me/cv/upload', formData, true, true, 300000);

    if (result.error) {
        return {
            success: false,
            error: result.error.message,
        };
    }

    return {
        success: true,
        data: result.data?.data,
        parsedCV: result.data?.parsedCV,
        message: result.data?.message,
    };
}

export async function updateUserProfileComprehensive(
    data: UpdateUserProfileData,
): Promise<{
    success: boolean;
    data?: any;
    error?: string;
}> {
    const result = await handleRequest<any>(
        'PATCH',
        '/users/me/profile',
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

// ============================================================================
// USER RESOURCES (Skills, Experience, Education, etc.)
// ============================================================================

export async function getUserSkills(userId: string): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
}> {
    const result = await handleRequest<any[]>(
        'GET',
        `/users/${userId}/skills`,
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

export async function createUserSkill(data: any): Promise<{
    success: boolean;
    data?: any;
    error?: string;
}> {
    const result = await handleRequest<any>('POST', '/skills', data, true);

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

export async function updateUserSkill(
    id: string,
    data: any,
): Promise<{
    success: boolean;
    data?: any;
    error?: string;
}> {
    const result = await handleRequest<any>(
        'PATCH',
        `/skills/${id}`,
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

export async function deleteUserSkill(id: string): Promise<{
    success: boolean;
    error?: string;
}> {
    const result = await handleRequest(
        'DELETE',
        `/skills/${id}`,
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
// GENERIC RESOURCE OPERATIONS
// ============================================================================

// Map resource names to backend endpoint paths
const resourcePathMap: Record<string, string> = {
    'work-experiences': 'work-experience',
    educations: 'education',
    certifications: 'certifications',
    projects: 'projects',
    languages: 'languages',
    skills: 'skills',
    awards: 'awards',
    publications: 'publications',
    'volunteer-work': 'volunteer-work',
    references: 'references',
    'social-links': 'social-links',
};

export async function getUserResource(
    userId: string,
    resource:
        | 'experience'
        | 'education'
        | 'certifications'
        | 'projects'
        | 'languages',
): Promise<{
    success: boolean;
    data?: any[];
    error?: string;
}> {
    const result = await handleRequest<any[]>(
        'GET',
        `/users/${userId}/${resource}`,
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

export async function createResource(
    resource: string,
    data: any,
): Promise<{
    success: boolean;
    data?: any;
    error?: string;
}> {
    // Map resource name to correct backend path
    const backendPath = resourcePathMap[resource] || resource;
    const result = await handleRequest<any>(
        'POST',
        `/users/me/${backendPath}`,
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

export async function updateResource(
    resource: string,
    id: string,
    data: any,
): Promise<{
    success: boolean;
    data?: any;
    error?: string;
}> {
    // Map resource name to correct backend path
    const backendPath = resourcePathMap[resource] || resource;
    // For single-item resources, use the resourceId path pattern
    const idSuffix = backendPath.endsWith('s')
        ? backendPath.slice(0, -1) + 'Id'
        : backendPath + 'Id';
    const result = await handleRequest<any>(
        'PATCH',
        `/users/me/${backendPath}/${id}`,
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

export async function deleteResource(
    resource: string,
    id: string,
): Promise<{
    success: boolean;
    error?: string;
}> {
    // Map resource name to correct backend path
    const backendPath = resourcePathMap[resource] || resource;
    const result = await handleRequest(
        'DELETE',
        `/users/me/${backendPath}/${id}`,
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
