'use server';

import { handleRequest } from '@/lib/server-request';
import {
    Company,
    CreateCompanyDto,
    UpdateBrandingDto,
    UpdateAboutSeoDto,
    UpdateSocialsDto,
} from '@/types/company.types';

/**
 * Create a new company profile (BUSINESS role only)
 */
export async function createCompany(data: CreateCompanyDto): Promise<{
    success: boolean;
    data?: Company;
    error?: string;
}> {
    const result = await handleRequest<Company>('POST', '/company', data, true);

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
 * Get current user's company profile
 */
export async function getMyCompany(): Promise<{
    success: boolean;
    data?: Company;
    error?: string;
}> {
    const result = await handleRequest<Company>(
        'GET',
        '/company/me',
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
 * Get public company profile by slug
 */
export async function getPublicCompany(slug: string): Promise<{
    success: boolean;
    data?: Company;
    error?: string;
}> {
    const result = await handleRequest<Company>(
        'GET',
        `/company/public/${slug}`,
        undefined,
        false,
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
 * Update company branding
 */
export async function updateCompanyBranding(data: UpdateBrandingDto): Promise<{
    success: boolean;
    data?: Company;
    error?: string;
}> {
    const result = await handleRequest<Company>(
        'PATCH',
        '/company/branding',
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
 * Update company about and SEO
 */
export async function updateCompanyAboutSeo(data: UpdateAboutSeoDto): Promise<{
    success: boolean;
    data?: Company;
    error?: string;
}> {
    const result = await handleRequest<Company>(
        'PATCH',
        '/company/about-seo',
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
 * Update company social links
 */
export async function updateCompanySocials(data: UpdateSocialsDto): Promise<{
    success: boolean;
    data?: Company;
    error?: string;
}> {
    const result = await handleRequest<Company>(
        'PATCH',
        '/company/socials',
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
