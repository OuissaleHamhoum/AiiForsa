import { notFound } from 'next/navigation';
import { getResume } from '@/actions/resume-actions';
import type { Resume } from '@/types/resume.types';
import { ResumeEditorClient } from './_components/ResumeEditorClient';

/**
 * Resume Editor Page - Server Component
 * Fetches resume data and renders the editor interface
 */
export default async function ResumeEditorPage({
    params,
}: {
    params: Promise<{ resumeId: string }>;
}) {
    const { resumeId } = await params;

    // Fetch resume data on server
    const result = await getResume(resumeId);

    if (!result.success || !result.data) notFound();

    // Convert server resume to client format
    const clientResume = convertServerToClientResume(result.data);

    return <ResumeEditorClient initialResume={clientResume} />;
}

// Convert server resume to client resume format
function convertServerToClientResume(serverResume: any): Resume {
    // Create basic sections - sorted by order from DB
    const sections =
        serverResume.sections
            ?.sort((a: any, b: any) => a.order - b.order)
            .map((section: any) => {
                const type = section.type.toLowerCase();

                // Handle all section types with proper data mapping
                switch (type) {
                    case 'profile':
                        return {
                            type: 'profile',
                            id: section.id,
                            data: section.content || {
                                name: '',
                                email: '',
                                phone: '',
                                location: '',
                            },
                        };
                    case 'summary':
                        return {
                            type: 'summary',
                            id: section.id,
                            data: section.content || { content: '' },
                        };
                    case 'links':
                        return {
                            type: 'links',
                            id: section.id,
                            data: section.content || {},
                        };
                    case 'experience':
                        return {
                            type: 'experience',
                            id: section.id,
                            data: { entries: section.content?.entries || [] },
                        };
                    case 'education':
                        return {
                            type: 'education',
                            id: section.id,
                            data: { entries: section.content?.entries || [] },
                        };
                    case 'skills':
                        return {
                            type: 'skills',
                            id: section.id,
                            data: {
                                categories: section.content?.categories || [],
                            },
                        };
                    case 'languages':
                        return {
                            type: 'languages',
                            id: section.id,
                            data: { entries: section.content?.entries || [] },
                        };
                    case 'certifications':
                        return {
                            type: 'certifications',
                            id: section.id,
                            data: { entries: section.content?.entries || [] },
                        };
                    case 'courses':
                        return {
                            type: 'courses',
                            id: section.id,
                            data: { entries: section.content?.entries || [] },
                        };
                    case 'projects':
                        return {
                            type: 'projects',
                            id: section.id,
                            data: { entries: section.content?.entries || [] },
                        };
                    case 'awards':
                        return {
                            type: 'awards',
                            id: section.id,
                            data: { entries: section.content?.entries || [] },
                        };
                    case 'publications':
                        return {
                            type: 'publications',
                            id: section.id,
                            data: { entries: section.content?.entries || [] },
                        };
                    case 'volunteer':
                        return {
                            type: 'volunteer',
                            id: section.id,
                            data: { entries: section.content?.entries || [] },
                        };
                    case 'references':
                        return {
                            type: 'references',
                            id: section.id,
                            data: { entries: section.content?.entries || [] },
                        };
                    case 'custom':
                        return {
                            type: 'custom',
                            id: section.id,
                            title: section.title || 'Custom Section',
                            data: section.content || { content: '' },
                        };
                    default:
                        // Fallback for unknown types
                        return {
                            type: 'custom',
                            id: section.id,
                            title: section.title || section.type,
                            data: section.content || {},
                        };
                }
            }) || [];

    return {
        id: serverResume.id,
        title: serverResume.title,
        sections,
        sectionOrder: sections.map((s: any) => s.type),
        updatedAt: new Date(serverResume.updatedAt).toISOString(),
        createdAt: new Date(serverResume.createdAt).toISOString(),
        template: {
            id: 'default',
            name: 'Default',
            style: 'modern',
            thumbnail: '',
            isPremium: false,
        },
        isPublic: serverResume.isPublic || false,
    };
}
