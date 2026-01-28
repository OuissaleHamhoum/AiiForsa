/**
 * Resume Builder Types
 * Defines the complete data structure for resume creation and management
 */

// Resume Section Types
export type ResumeSectionType =
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

// Template Style Types
export type TemplateStyle =
    | 'modern'
    | 'classic'
    | 'minimal'
    | 'creative'
    | 'professional';

// Profile Section
export interface ProfileSection {
    type: 'profile';
    id?: string; // Optional ID for backend operations
    data: {
        name: string;
        professionalTitle?: string;
        email: string;
        phone: string;
        location: string;
        summary?: string;
        photo?: string;
    };
}

// Links Section
export interface LinksSection {
    type: 'links';
    id?: string; // Optional ID for backend operations
    data: {
        website?: string;
        linkedin?: string;
        github?: string;
        portfolio?: string;
    };
}

// Summary Section
export interface SummarySection {
    type: 'summary';
    id?: string; // Optional ID for backend operations
    data: {
        content: string;
    };
}

// Experience Entry
export interface ExperienceEntry {
    id: string;
    jobTitle: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string | null; // null means current
    current: boolean;
    description: string;
    achievements: string[];
    tags?: string[];
}

export interface ExperienceSection {
    type: 'experience';
    id?: string; // Optional ID for backend operations
    data: {
        entries: ExperienceEntry[];
    };
}

// Education Entry
export interface EducationEntry {
    id: string;
    degree: string;
    major?: string;
    institution: string;
    location: string;
    startDate: string;
    endDate: string | null;
    current: boolean;
    gpa?: string;
    description?: string;
    achievements: string[];
}

export interface EducationSection {
    type: 'education';
    id?: string; // Optional ID for backend operations
    data: {
        entries: EducationEntry[];
    };
}

// Skills Section
export interface SkillCategory {
    id: string;
    name: string;
    skills: string[];
}

export interface SkillsSection {
    type: 'skills';
    id?: string; // Optional ID for backend operations
    data: {
        categories: SkillCategory[];
    };
}

// Certifications Entry
export interface CertificationEntry {
    id: string;
    name: string;
    issuer: string;
    date: string;
    expiryDate?: string;
    credentialId?: string;
    credentialUrl?: string;
}

export interface CertificationsSection {
    type: 'certifications';
    id?: string; // Optional ID for backend operations
    data: {
        entries: CertificationEntry[];
    };
}

// Courses Entry
export interface CourseEntry {
    id: string;
    name: string;
    institution: string;
    date: string;
    description?: string;
}

export interface CoursesSection {
    type: 'courses';
    id?: string; // Optional ID for backend operations
    data: {
        entries: CourseEntry[];
    };
}

// Projects Entry
export interface ProjectEntry {
    id: string;
    name: string;
    description: string;
    role?: string;
    technologies: string[];
    startDate: string;
    endDate: string | null;
    current: boolean;
    url?: string;
    githubUrl?: string;
    highlights: string[];
}

export interface ProjectsSection {
    type: 'projects';
    id?: string; // Optional ID for backend operations
    data: {
        entries: ProjectEntry[];
    };
}

// Languages Entry
export interface LanguageEntry {
    id: string;
    language: string;
    proficiency: 'native' | 'fluent' | 'advanced' | 'intermediate' | 'beginner';
}

export interface LanguagesSection {
    type: 'languages';
    id?: string; // Optional ID for backend operations
    data: {
        entries: LanguageEntry[];
    };
}

// Awards Entry
export interface AwardEntry {
    id: string;
    title: string;
    issuer: string;
    date: string;
    description?: string;
}

export interface AwardsSection {
    type: 'awards';
    id?: string; // Optional ID for backend operations
    data: {
        entries: AwardEntry[];
    };
}

// Publications Entry
export interface PublicationEntry {
    id: string;
    title: string;
    publisher: string;
    date: string;
    url?: string;
    description?: string;
}

export interface PublicationsSection {
    type: 'publications';
    id?: string; // Optional ID for backend operations
    data: {
        entries: PublicationEntry[];
    };
}

// Volunteer Entry
export interface VolunteerEntry {
    id: string;
    role: string;
    organization: string;
    location: string;
    startDate: string;
    endDate: string | null;
    current: boolean;
    description: string;
}

export interface VolunteerSection {
    type: 'volunteer';
    id?: string; // Optional ID for backend operations
    data: {
        entries: VolunteerEntry[];
    };
}

// References Entry
export interface ReferenceEntry {
    id: string;
    name: string;
    position: string;
    company: string;
    email: string;
    phone: string;
    relationship?: string;
}

export interface ReferencesSection {
    type: 'references';
    id?: string; // Optional ID for backend operations
    data: {
        entries: ReferenceEntry[];
    };
}

// Custom Section
export interface CustomSection {
    type: 'custom';
    id?: string; // Optional ID for backend operations
    title: string;
    data: {
        content: string;
    };
}

// Union type for all sections
export type ResumeSection =
    | ProfileSection
    | LinksSection
    | SummarySection
    | ExperienceSection
    | EducationSection
    | SkillsSection
    | CertificationsSection
    | CoursesSection
    | ProjectsSection
    | LanguagesSection
    | AwardsSection
    | PublicationsSection
    | VolunteerSection
    | ReferencesSection
    | CustomSection;

// Resume Template
export interface ResumeTemplate {
    id: string;
    name: string;
    style: TemplateStyle;
    thumbnail: string;
    previewUrl?: string;
    isPremium: boolean;
}

// Resume Metadata
export interface ResumeMetadata {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    template: ResumeTemplate;
    thumbnail?: string;
    aiScore?: number;
    isPublic: boolean;
    shareUrl?: string;
}

// Complete Resume Structure
export interface Resume extends ResumeMetadata {
    sections: ResumeSection[];
    sectionOrder: ResumeSectionType[]; // Defines the order of sections
    customStyles?: {
        primaryColor?: string;
        secondaryColor?: string;
        fontFamily?: string;
        fontSize?: number;
    };
}

// Section Configuration for "Add Content" Dialog
export interface SectionConfig {
    type: ResumeSectionType;
    title: string;
    description: string;
    icon: string; // Icon name or component
    isRequired?: boolean;
    isMultiple?: boolean; // Can have multiple entries
}

// AI Analysis Types
export interface SectionScore {
    section: ResumeSectionType;
    score: number;
    issues: string[];
    suggestions: string[];
}

export interface ResumeAnalysis {
    overallScore: number;
    sectionScores: SectionScore[];
    grammarIssues: Array<{
        section: ResumeSectionType;
        field: string;
        issue: string;
        suggestion: string;
    }>;
    readabilityScore: number;
    atsCompatibility: number;
    recommendations: string[];
    matchScore?: number; // When compared to a job description
}

// Export Options
export type ExportFormat = 'pdf' | 'docx' | 'txt' | 'json';

export interface ExportOptions {
    format: ExportFormat;
    includeReferences: boolean;
    includePhoto: boolean;
    paperSize: 'A4' | 'Letter';
    margins: 'normal' | 'narrow' | 'wide';
}
