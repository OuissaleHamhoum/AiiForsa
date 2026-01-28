/**
 * Resume Data Transformation Utilities
 * Transforms between frontend Resume format and backend CV template format
 */

import type { Resume } from '@/types/resume.types';

export interface CVTemplate {
    personalInformation: {
        fullName: string;
        email: string;
        phone: string;
        location: string;
        links: string[];
        summary: string;
    };
    education: Array<{
        degree: string;
        major: string;
        institution: string;
        location: string;
        startDate: string;
        endDate: string;
        gpa: string;
    }>;
    workExperience: Array<{
        jobTitle: string;
        company: string;
        location: string;
        startDate: string;
        endDate: string;
        description: string[];
        tags: string[];
    }>;
    projects: Array<{
        projectName: string;
        description: string;
        role: string;
        tags: string[];
        startDate: string;
        endDate: string;
        link: string;
    }>;
    skills: string[];
    languages: Array<{
        language: string;
        proficiency: string;
    }>;
    certifications: Array<{
        certificationName: string;
        dateObtained: string;
        expirationDate: string;
    }>;
    awards: Array<{
        awardName: string;
        issuingOrganization: string;
        dateReceived: string;
        description: string;
    }>;
    volunteerExperience: Array<{
        role: string;
        organization: string;
        location: string;
        startDate: string;
        endDate: string;
        description: string;
    }>;
}

/**
 * Transform frontend Resume to backend CV Template format
 */
export function transformResumeToCV(resume: Resume): CVTemplate {
    const cv: CVTemplate = {
        personalInformation: {
            fullName: '',
            email: '',
            phone: '',
            location: '',
            links: [],
            summary: '',
        },
        education: [],
        workExperience: [],
        projects: [],
        skills: [],
        languages: [],
        certifications: [],
        awards: [],
        volunteerExperience: [],
    };

    // Process each section
    resume.sections.forEach(section => {
        switch (section.type) {
            case 'profile':
                cv.personalInformation.fullName = section.data.name || '';
                cv.personalInformation.email = section.data.email || '';
                cv.personalInformation.phone = section.data.phone || '';
                cv.personalInformation.location = section.data.location || '';
                cv.personalInformation.summary = section.data.summary || '';
                break;

            case 'summary':
                cv.personalInformation.summary = section.data.content || '';
                break;

            case 'links':
                const links = [];
                if (section.data.website) links.push(section.data.website);
                if (section.data.linkedin) links.push(section.data.linkedin);
                if (section.data.github) links.push(section.data.github);
                if (section.data.portfolio) links.push(section.data.portfolio);
                cv.personalInformation.links = links;
                break;

            case 'education':
                cv.education = section.data.entries.map((entry: any) => ({
                    degree: entry.degree || '',
                    major: '', // Not in current schema but in CV template
                    institution: entry.institution || '',
                    location: entry.location || '',
                    startDate: entry.startDate || '',
                    endDate: entry.current ? 'Present' : entry.endDate || '',
                    gpa: entry.gpa || '',
                }));
                break;

            case 'experience':
                cv.workExperience = section.data.entries.map((entry: any) => ({
                    jobTitle: entry.jobTitle || '',
                    company: entry.company || '',
                    location: entry.location || '',
                    startDate: entry.startDate || '',
                    endDate: entry.current ? 'Present' : entry.endDate || '',
                    description: entry.achievements || [],
                    tags: [], // Not in current schema
                }));
                break;

            case 'projects':
                cv.projects = section.data.entries.map((entry: any) => ({
                    projectName: entry.name || '',
                    description: entry.description || '',
                    role: '', // Not in current schema
                    tags: entry.technologies || [],
                    startDate: entry.startDate || '',
                    endDate: entry.current ? 'Present' : entry.endDate || '',
                    link: entry.url || entry.githubUrl || '',
                }));
                break;

            case 'skills':
                // Flatten all skill categories into a single array
                const allSkills: string[] = [];
                section.data.categories.forEach((category: any) => {
                    allSkills.push(...(category.skills || []));
                });
                cv.skills = allSkills;
                break;

            case 'languages':
                cv.languages = section.data.entries.map((entry: any) => ({
                    language: entry.language || '',
                    proficiency: entry.proficiency || '',
                }));
                break;

            case 'certifications':
                cv.certifications = section.data.entries.map((entry: any) => ({
                    certificationName: entry.name || '',
                    dateObtained: entry.date || '',
                    expirationDate: entry.expiryDate || '',
                }));
                break;

            case 'awards':
                cv.awards = section.data.entries.map((entry: any) => ({
                    awardName: entry.title || '',
                    issuingOrganization: entry.issuer || '',
                    dateReceived: entry.date || '',
                    description: entry.description || '',
                }));
                break;

            case 'volunteer':
                cv.volunteerExperience = section.data.entries.map(
                    (entry: any) => ({
                        role: entry.role || '',
                        organization: entry.organization || '',
                        location: entry.location || '',
                        startDate: entry.startDate || '',
                        endDate: entry.current
                            ? 'Present'
                            : entry.endDate || '',
                        description: entry.description || '',
                    }),
                );
                break;
        }
    });

    return cv;
}

/**
 * Transform backend CV Template to frontend Resume format
 */
export function transformCVToResume(cv: CVTemplate): Partial<Resume> {
    const sections: any[] = [];
    const sectionOrder: any[] = [];

    // Personal Information -> Profile Section
    if (
        cv.personalInformation.fullName ||
        cv.personalInformation.email ||
        cv.personalInformation.phone
    ) {
        sections.push({
            type: 'profile',
            data: {
                name: cv.personalInformation.fullName,
                email: cv.personalInformation.email,
                phone: cv.personalInformation.phone,
                location: cv.personalInformation.location,
                summary: cv.personalInformation.summary,
            },
        });
        sectionOrder.push('profile');
    }

    // Links Section
    if (cv.personalInformation.links.length > 0) {
        sections.push({
            type: 'links',
            data: {
                website: cv.personalInformation.links[0] || '',
                linkedin: cv.personalInformation.links[1] || '',
                github: cv.personalInformation.links[2] || '',
                portfolio: cv.personalInformation.links[3] || '',
            },
        });
        sectionOrder.push('links');
    }

    // Work Experience
    if (cv.workExperience.length > 0) {
        sections.push({
            type: 'experience',
            data: {
                entries: cv.workExperience.map(exp => ({
                    id: crypto.randomUUID(),
                    jobTitle: exp.jobTitle,
                    company: exp.company,
                    location: exp.location,
                    startDate: exp.startDate,
                    endDate: exp.endDate === 'Present' ? null : exp.endDate,
                    current: exp.endDate === 'Present',
                    description: '',
                    achievements: exp.description,
                })),
            },
        });
        sectionOrder.push('experience');
    }

    // Education
    if (cv.education.length > 0) {
        sections.push({
            type: 'education',
            data: {
                entries: cv.education.map(edu => ({
                    id: crypto.randomUUID(),
                    degree: edu.degree,
                    institution: edu.institution,
                    location: edu.location,
                    startDate: edu.startDate,
                    endDate: edu.endDate === 'Present' ? null : edu.endDate,
                    current: edu.endDate === 'Present',
                    gpa: edu.gpa,
                    achievements: [],
                })),
            },
        });
        sectionOrder.push('education');
    }

    // Skills
    if (cv.skills.length > 0) {
        sections.push({
            type: 'skills',
            data: {
                categories: [
                    {
                        id: crypto.randomUUID(),
                        name: 'Skills',
                        skills: cv.skills,
                    },
                ],
            },
        });
        sectionOrder.push('skills');
    }

    // Projects
    if (cv.projects.length > 0) {
        sections.push({
            type: 'projects',
            data: {
                entries: cv.projects.map(proj => ({
                    id: crypto.randomUUID(),
                    name: proj.projectName,
                    description: proj.description,
                    technologies: proj.tags,
                    startDate: proj.startDate,
                    endDate: proj.endDate === 'Present' ? null : proj.endDate,
                    current: proj.endDate === 'Present',
                    url: proj.link,
                    highlights: [],
                })),
            },
        });
        sectionOrder.push('projects');
    }

    // Languages
    if (cv.languages.length > 0) {
        sections.push({
            type: 'languages',
            data: {
                entries: cv.languages.map(lang => ({
                    id: crypto.randomUUID(),
                    language: lang.language,
                    proficiency: lang.proficiency as any,
                })),
            },
        });
        sectionOrder.push('languages');
    }

    // Certifications
    if (cv.certifications.length > 0) {
        sections.push({
            type: 'certifications',
            data: {
                entries: cv.certifications.map(cert => ({
                    id: crypto.randomUUID(),
                    name: cert.certificationName,
                    issuer: '',
                    date: cert.dateObtained,
                    expiryDate: cert.expirationDate,
                })),
            },
        });
        sectionOrder.push('certifications');
    }

    // Awards
    if (cv.awards.length > 0) {
        sections.push({
            type: 'awards',
            data: {
                entries: cv.awards.map(award => ({
                    id: crypto.randomUUID(),
                    title: award.awardName,
                    issuer: award.issuingOrganization,
                    date: award.dateReceived,
                    description: award.description,
                })),
            },
        });
        sectionOrder.push('awards');
    }

    // Volunteer Experience
    if (cv.volunteerExperience.length > 0) {
        sections.push({
            type: 'volunteer',
            data: {
                entries: cv.volunteerExperience.map(vol => ({
                    id: crypto.randomUUID(),
                    role: vol.role,
                    organization: vol.organization,
                    location: vol.location,
                    startDate: vol.startDate,
                    endDate: vol.endDate === 'Present' ? null : vol.endDate,
                    current: vol.endDate === 'Present',
                    description: vol.description,
                })),
            },
        });
        sectionOrder.push('volunteer');
    }

    return {
        sections,
        sectionOrder,
    };
}
