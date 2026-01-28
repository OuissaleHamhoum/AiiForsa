/**
 * Resume Template Types
 * Defines available resume templates and their styling options
 */

export type ResumeTemplateId =
    | 'modern'
    | 'classic'
    | 'minimal'
    | 'professional'
    | 'creative';

export interface ResumeTemplateConfig {
    id: ResumeTemplateId;
    name: string;
    description: string;
    thumbnail: string;
    isPremium: boolean;
    styles: {
        headerStyle: 'bold' | 'minimal' | 'accent' | 'gradient';
        sectionStyle: 'bordered' | 'minimal' | 'boxed';
        fontPairing: 'modern' | 'classic' | 'minimal';
        colorScheme: 'blue' | 'gray' | 'orange' | 'green' | 'purple';
        spacing: 'compact' | 'comfortable' | 'spacious';
    };
}

export const RESUME_TEMPLATES: ResumeTemplateConfig[] = [
    {
        id: 'modern',
        name: 'Modern',
        description: 'Clean and contemporary design with accent colors',
        thumbnail: '/templates/modern.png',
        isPremium: false,
        styles: {
            headerStyle: 'gradient',
            sectionStyle: 'minimal',
            fontPairing: 'modern',
            colorScheme: 'blue',
            spacing: 'comfortable',
        },
    },
    {
        id: 'classic',
        name: 'Classic',
        description: 'Traditional professional layout',
        thumbnail: '/templates/classic.png',
        isPremium: false,
        styles: {
            headerStyle: 'bold',
            sectionStyle: 'bordered',
            fontPairing: 'classic',
            colorScheme: 'gray',
            spacing: 'comfortable',
        },
    },
    {
        id: 'minimal',
        name: 'Minimal',
        description: 'Simple and clean with maximum readability',
        thumbnail: '/templates/minimal.png',
        isPremium: false,
        styles: {
            headerStyle: 'minimal',
            sectionStyle: 'minimal',
            fontPairing: 'minimal',
            colorScheme: 'gray',
            spacing: 'spacious',
        },
    },
    {
        id: 'professional',
        name: 'Professional',
        description: 'Corporate style with structured sections',
        thumbnail: '/templates/professional.png',
        isPremium: true,
        styles: {
            headerStyle: 'accent',
            sectionStyle: 'boxed',
            fontPairing: 'modern',
            colorScheme: 'orange',
            spacing: 'compact',
        },
    },
    {
        id: 'creative',
        name: 'Creative',
        description: 'Bold design for creative professionals',
        thumbnail: '/templates/creative.png',
        isPremium: true,
        styles: {
            headerStyle: 'gradient',
            sectionStyle: 'boxed',
            fontPairing: 'modern',
            colorScheme: 'purple',
            spacing: 'comfortable',
        },
    },
];
