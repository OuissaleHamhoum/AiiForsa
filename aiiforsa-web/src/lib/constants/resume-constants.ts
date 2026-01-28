/**
 * Resume Builder Constants
 * Centralized configuration for the resume builder
 */

/**
 * A4 Paper Dimensions (in millimeters)
 */
export const A4_DIMENSIONS = {
    WIDTH_MM: 210,
    HEIGHT_MM: 297,
    WIDTH_PX: 794, // at 96 DPI
    HEIGHT_PX: 1123, // at 96 DPI
} as const;

/**
 * Typography Configuration
 */
export const TYPOGRAPHY = {
    NAME: {
        SIZE: '28px',
        WEIGHT: '700',
        LINE_HEIGHT: '1.2',
    },
    HEADING: {
        SIZE: '16px',
        WEIGHT: '600',
        LINE_HEIGHT: '1.3',
    },
    SUBHEADING: {
        SIZE: '14px',
        WEIGHT: '600',
        LINE_HEIGHT: '1.3',
    },
    BODY: {
        SIZE: '11px',
        WEIGHT: '400',
        LINE_HEIGHT: '1.6',
    },
} as const;

/**
 * Professional Fonts
 */
export const RESUME_FONTS = [
    'Inter',
    'Roboto',
    'Lato',
    'Source Sans Pro',
] as const;

/**
 * PDF Export Configuration
 */
export const PDF_CONFIG = {
    FORMAT: 'A4' as const,
    PRINT_BACKGROUND: true,
    MARGIN: {
        TOP: '20mm',
        RIGHT: '20mm',
        BOTTOM: '20mm',
        LEFT: '20mm',
    },
    TIMEOUT: 30000, // 30 seconds
} as const;

/**
 * Page Break Classes
 */
export const PAGE_BREAK_CLASSES = {
    AVOID_INSIDE: 'page-break-inside: avoid; break-inside: avoid;',
    AVOID_AFTER: 'page-break-after: avoid; break-after: avoid;',
    AVOID_BEFORE: 'page-break-before: avoid; break-before: avoid;',
    ALWAYS_AFTER: 'page-break-after: always; break-after: page;',
} as const;

/**
 * Section Types
 */
export const SECTION_TYPES = [
    'profile',
    'experience',
    'education',
    'skills',
    'languages',
    'certifications',
    'awards',
    'projects',
    'publications',
    'courses',
    'volunteer',
    'references',
    'links',
    'custom',
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

/**
 * Section Display Names
 */
export const SECTION_NAMES: Record<SectionType, string> = {
    profile: 'Profile',
    experience: 'Work Experience',
    education: 'Education',
    skills: 'Skills',
    languages: 'Languages',
    certifications: 'Certifications',
    awards: 'Awards & Honors',
    projects: 'Projects',
    publications: 'Publications',
    courses: 'Courses',
    volunteer: 'Volunteer Experience',
    references: 'References',
    links: 'Links',
    custom: 'Custom Section',
} as const;

/**
 * Zoom Levels
 */
export const ZOOM_CONFIG = {
    MIN: 50,
    MAX: 150,
    DEFAULT: 100,
    STEP: 10,
} as const;

/**
 * Resume Validation Rules
 */
export const VALIDATION_RULES = {
    NAME: {
        MIN_LENGTH: 2,
        MAX_LENGTH: 100,
    },
    EMAIL: {
        PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    PHONE: {
        MIN_LENGTH: 10,
        PATTERN: /^[\d\s\-\+\(\)]+$/,
    },
    SUMMARY: {
        MAX_LENGTH: 500,
        RECOMMENDED_LENGTH: 150,
    },
    SECTION_TITLE: {
        MIN_LENGTH: 1,
        MAX_LENGTH: 50,
    },
} as const;

/**
 * Character Limits
 */
export const CHARACTER_LIMITS = {
    EXPERIENCE_DESCRIPTION: 500,
    ACHIEVEMENT: 200,
    SUMMARY: 500,
    CUSTOM_CONTENT: 1000,
} as const;

/**
 * Estimated Characters Per Page
 */
export const CHARS_PER_PAGE = 3000;

/**
 * Template Color Schemes
 */
export const COLOR_SCHEMES = {
    BLUE: {
        PRIMARY: '#3b82f6',
        ACCENT: '#2563eb',
        LIGHT: '#dbeafe',
    },
    GRAY: {
        PRIMARY: '#6b7280',
        ACCENT: '#4b5563',
        LIGHT: '#f3f4f6',
    },
    ORANGE: {
        PRIMARY: '#f97316',
        ACCENT: '#ea580c',
        LIGHT: '#ffedd5',
    },
    GREEN: {
        PRIMARY: '#10b981',
        ACCENT: '#059669',
        LIGHT: '#d1fae5',
    },
    PURPLE: {
        PRIMARY: '#8b5cf6',
        ACCENT: '#7c3aed',
        LIGHT: '#ede9fe',
    },
} as const;

/**
 * Export Formats
 */
export const EXPORT_FORMATS = ['pdf', 'docx', 'txt', 'json'] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

/**
 * Default Resume State
 */
export const DEFAULT_RESUME = {
    title: 'Untitled Resume',
    sections: [],
    sectionOrder: [],
    isPublic: false,
} as const;

/**
 * Browser Print Settings
 */
export const PRINT_SETTINGS = {
    PAGE_SIZE: 'A4',
    ORIENTATION: 'portrait' as const,
    COLOR_MODE: 'color' as const,
    SCALE: 100,
} as const;
