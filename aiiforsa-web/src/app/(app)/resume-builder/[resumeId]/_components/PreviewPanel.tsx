'use client';

/**
 * Preview Panel Component
 * Right panel showing live preview of the resume
 */

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type {
    EducationSection,
    ExperienceSection,
    LinksSection,
    ProfileSection,
    Resume,
    SkillsSection,
    SummarySection,
} from '@/types/resume.types';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';

interface PreviewPanelProps {
    resume: Resume;
}

export function PreviewPanel({ resume }: PreviewPanelProps) {
    const [zoom, setZoom] = useState(100);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 150));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));

    const getProfileSection = () => {
        return resume.sections.find(s => s.type === 'profile') as
            | ProfileSection
            | undefined;
    };

    const getSummarySection = () => {
        return resume.sections.find(s => s.type === 'summary') as
            | SummarySection
            | undefined;
    };

    const getExperienceSection = () => {
        return resume.sections.find(s => s.type === 'experience') as
            | ExperienceSection
            | undefined;
    };

    const getEducationSection = () => {
        return resume.sections.find(s => s.type === 'education') as
            | EducationSection
            | undefined;
    };

    const getSkillsSection = () => {
        return resume.sections.find(s => s.type === 'skills') as
            | SkillsSection
            | undefined;
    };

    const getLinksSection = () => {
        return resume.sections.find(s => s.type === 'links') as
            | LinksSection
            | undefined;
    };

    const profileSection = getProfileSection();
    const summarySection = getSummarySection();
    const experienceSection = getExperienceSection();
    const educationSection = getEducationSection();
    const skillsSection = getSkillsSection();
    const linksSection = getLinksSection();

    return (
        <div className="flex h-full flex-col">
            {/* Preview */}
            <ScrollArea className="overflow-y-hidden px-2">
                <div className="flex justify-center">
                    <div
                        className="w-[210mm] origin-top bg-white shadow-2xl transition-transform"
                        style={{
                            transform: `scale(${zoom / 100})`,
                            minHeight: '297mm', // A4 height
                        }}
                    >
                        {/* Resume Content */}
                        <div className="p-12 text-gray-900">
                            {resume.sections.length === 0 ? (
                                <div className="flex h-full items-center justify-center py-24 text-center">
                                    <div>
                                        <p className="mb-2 text-lg font-semibold text-gray-600">
                                            Your resume preview will appear here
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            Start adding content to see the
                                            preview
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Profile Section */}
                                    {profileSection && (
                                        <div className="space-y-2">
                                            <h1 className="text-4xl font-bold">
                                                {profileSection.data.name ||
                                                    'Your Name'}
                                            </h1>
                                            {profileSection.data
                                                .professionalTitle && (
                                                <h2 className="text-xl font-semibold text-gray-700">
                                                    {
                                                        profileSection.data
                                                            .professionalTitle
                                                    }
                                                </h2>
                                            )}
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                                                {profileSection.data.email && (
                                                    <span>
                                                        {
                                                            profileSection.data
                                                                .email
                                                        }
                                                    </span>
                                                )}
                                                {profileSection.data.phone && (
                                                    <span>
                                                        {
                                                            profileSection.data
                                                                .phone
                                                        }
                                                    </span>
                                                )}
                                                {profileSection.data
                                                    .location && (
                                                    <span>
                                                        {
                                                            profileSection.data
                                                                .location
                                                        }
                                                    </span>
                                                )}
                                            </div>
                                            {profileSection.data.summary && (
                                                <p className="mt-4 text-sm leading-relaxed text-gray-700">
                                                    {
                                                        profileSection.data
                                                            .summary
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Links Section */}
                                    {linksSection && (
                                        <div>
                                            <h2 className="mb-2 pb-1 text-xl font-bold uppercase">
                                                Links
                                            </h2>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-blue-600">
                                                {linksSection.data.website && (
                                                    <a
                                                        href={
                                                            linksSection.data
                                                                .website
                                                        }
                                                        className="hover:underline"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        Website
                                                    </a>
                                                )}
                                                {linksSection.data.linkedin && (
                                                    <a
                                                        href={
                                                            linksSection.data
                                                                .linkedin
                                                        }
                                                        className="hover:underline"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        LinkedIn
                                                    </a>
                                                )}
                                                {linksSection.data.github && (
                                                    <a
                                                        href={
                                                            linksSection.data
                                                                .github
                                                        }
                                                        className="hover:underline"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        GitHub
                                                    </a>
                                                )}
                                                {linksSection.data
                                                    .portfolio && (
                                                    <a
                                                        href={
                                                            linksSection.data
                                                                .portfolio
                                                        }
                                                        className="hover:underline"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        Portfolio
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Summary Section */}
                                    {summarySection &&
                                        summarySection.data.content && (
                                            <div>
                                                <h2 className="mb-2 border-b-2 border-gray-800 pb-1 text-xl font-bold uppercase">
                                                    Professional Summary
                                                </h2>
                                                <p className="text-sm leading-relaxed text-gray-700">
                                                    {
                                                        summarySection.data
                                                            .content
                                                    }
                                                </p>
                                            </div>
                                        )}

                                    {/* Experience Section */}
                                    {experienceSection &&
                                        experienceSection.data.entries.length >
                                            0 && (
                                            <div>
                                                <h2 className="mb-2 border-b-2 border-gray-800 pb-1 text-xl font-bold uppercase">
                                                    Work Experience
                                                </h2>
                                                <div className="space-y-4">
                                                    {experienceSection.data.entries.map(
                                                        entry => (
                                                            <div key={entry.id}>
                                                                <div className="mb-1 flex items-start justify-between">
                                                                    <div>
                                                                        <h3 className="font-semibold">
                                                                            {
                                                                                entry.jobTitle
                                                                            }
                                                                        </h3>
                                                                        <p className="text-sm text-gray-600">
                                                                            {
                                                                                entry.company
                                                                            }{' '}
                                                                            •{' '}
                                                                            {
                                                                                entry.location
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <p className="text-sm text-gray-600">
                                                                        {
                                                                            entry.startDate
                                                                        }{' '}
                                                                        -{' '}
                                                                        {entry.current
                                                                            ? 'Present'
                                                                            : entry.endDate}
                                                                    </p>
                                                                </div>
                                                                {entry.description && (
                                                                    <p className="mb-2 text-sm text-gray-700">
                                                                        {
                                                                            entry.description
                                                                        }
                                                                    </p>
                                                                )}
                                                                {entry.achievements &&
                                                                    entry
                                                                        .achievements
                                                                        .length >
                                                                        0 && (
                                                                        <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                                                                            {entry.achievements.map(
                                                                                (
                                                                                    achievement,
                                                                                    idx,
                                                                                ) => (
                                                                                    <li
                                                                                        key={
                                                                                            idx
                                                                                        }
                                                                                    >
                                                                                        {
                                                                                            achievement
                                                                                        }
                                                                                    </li>
                                                                                ),
                                                                            )}
                                                                        </ul>
                                                                    )}
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                    {/* Education Section */}
                                    {educationSection &&
                                        educationSection.data.entries.length >
                                            0 && (
                                            <div>
                                                <h2 className="mb-2 border-b-2 border-gray-800 pb-1 text-xl font-bold uppercase">
                                                    Education
                                                </h2>
                                                <div className="space-y-3">
                                                    {educationSection.data.entries.map(
                                                        entry => (
                                                            <div key={entry.id}>
                                                                <div className="mb-1 flex items-start justify-between">
                                                                    <div>
                                                                        <h3 className="font-semibold">
                                                                            {
                                                                                entry.degree
                                                                            }
                                                                        </h3>
                                                                        <p className="text-sm text-gray-600">
                                                                            {
                                                                                entry.institution
                                                                            }{' '}
                                                                            •{' '}
                                                                            {
                                                                                entry.location
                                                                            }
                                                                        </p>
                                                                    </div>
                                                                    <p className="text-sm text-gray-600">
                                                                        {
                                                                            entry.startDate
                                                                        }{' '}
                                                                        -{' '}
                                                                        {entry.current
                                                                            ? 'Present'
                                                                            : entry.endDate}
                                                                    </p>
                                                                </div>
                                                                {entry.gpa && (
                                                                    <p className="text-sm text-gray-700">
                                                                        GPA:{' '}
                                                                        {
                                                                            entry.gpa
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                    {/* Skills Section */}
                                    {skillsSection &&
                                        skillsSection.data.categories.length >
                                            0 && (
                                            <div>
                                                <h2 className="mb-2 border-b-2 border-gray-800 pb-1 text-xl font-bold uppercase">
                                                    Skills
                                                </h2>
                                                <div className="space-y-2">
                                                    {skillsSection.data.categories.map(
                                                        category => (
                                                            <div
                                                                key={
                                                                    category.id
                                                                }
                                                            >
                                                                <span className="font-semibold">
                                                                    {
                                                                        category.name
                                                                    }
                                                                    :{' '}
                                                                </span>
                                                                <span className="text-sm text-gray-700">
                                                                    {category.skills.join(
                                                                        ', ',
                                                                    )}
                                                                </span>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                    {/* Other sections can be rendered here */}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 absolute bottom-4 right-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleZoomOut}
                        className="text-foreground hover:bg-accent"
                    >
                        <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="min-w-[60px] text-center text-sm text-foreground">
                        {zoom}%
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleZoomIn}
                        className="text-foreground hover:bg-accent"
                    >
                        <ZoomIn className="h-4 w-4" />
                    </Button>
                </div>
            </ScrollArea>
        </div>
    );
}
