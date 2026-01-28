/**
 * Company profile interface
 */
export interface Company {
    id: string;
    name: string;
    slug: string;
    industry: string;
    tagline?: string | null;
    description?: string | null;
    website?: string | null;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    companySize?: string | null;
    locations?: string[];
    benefits?: string[];
    values?: string[];
    about?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    socialLinks?: Record<string, string> | null;
    createdAt: string;
    updatedAt: string;
}

/**
 * Create company DTO
 */
export interface CreateCompanyDto {
    name: string;
    industry: string;
    tagline?: string;
    description?: string;
    website?: string;
    logoUrl?: string;
    bannerUrl?: string;
    companySize?: string;
    locations?: string[];
    benefits?: string[];
    values?: string[];
}

/**
 * Update company branding DTO
 */
export interface UpdateBrandingDto {
    tagline?: string;
    logoUrl?: string;
    bannerUrl?: string;
    industry?: string;
    companySize?: string;
    locations?: string[];
    benefits?: string[];
    values?: string[];
}

/**
 * Update company about/SEO DTO
 */
export interface UpdateAboutSeoDto {
    about?: string;
    seoTitle?: string;
    seoDescription?: string;
}

/**
 * Update company social links DTO
 */
export interface UpdateSocialsDto {
    socialLinks: Record<string, string>;
}
