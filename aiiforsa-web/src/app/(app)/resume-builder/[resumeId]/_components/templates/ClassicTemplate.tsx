'use client';

/**
 * Classic Resume Template
 * Traditional professional layout with clear sections
 */

import type {
    Resume,
    ProfileSection,
    ExperienceSection,
    EducationSection,
    SkillsSection,
} from '@/types/resume.types';

interface TemplateProps {
    resume: Resume;
}

export function ClassicTemplate({ resume }: TemplateProps) {
    const profileSection = resume.sections.find(s => s.type === 'profile') as
        | ProfileSection
        | undefined;
    const experienceSection = resume.sections.find(
        s => s.type === 'experience',
    ) as ExperienceSection | undefined;
    const educationSection = resume.sections.find(
        s => s.type === 'education',
    ) as EducationSection | undefined;
    const skillsSection = resume.sections.find(s => s.type === 'skills') as
        | SkillsSection
        | undefined;

    return (
        <div className="a4-page w-[210mm] min-h-[297mm] p-8 text-gray-900 font-serif bg-white">
            {/* Classic Header */}
            <div className="resume-header text-center mb-4 pb-3 border-b-2 border-gray-800">
                <h1 className="text-2xl font-bold text-gray-900 mb-2 uppercase tracking-wide">
                    {profileSection?.data.name || 'Your Name'}
                </h1>
                {profileSection?.data.professionalTitle && (
                    <h2 className="text-lg font-medium text-gray-700 mb-2">
                        {profileSection.data.professionalTitle}
                    </h2>
                )}
                <div className="flex justify-center flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600">
                    {profileSection?.data.email && (
                        <span>{profileSection.data.email}</span>
                    )}
                    {profileSection?.data.phone && <span>•</span>}
                    {profileSection?.data.phone && (
                        <span>{profileSection.data.phone}</span>
                    )}
                    {profileSection?.data.location && <span>•</span>}
                    {profileSection?.data.location && (
                        <span>{profileSection.data.location}</span>
                    )}
                </div>
            </div>

            {/* Professional Summary */}
            {profileSection?.data.summary && (
                <div className="resume-section mb-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-2 pb-1 border-b border-gray-400 uppercase tracking-wide">
                        Professional Summary
                    </h2>
                    <p className="text-xs leading-relaxed text-gray-700 mt-2">
                        {profileSection.data.summary}
                    </p>
                </div>
            )}

            {/* Work Experience */}
            {experienceSection && experienceSection.data.entries.length > 0 && (
                <div className="resume-section mb-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-2 pb-1 border-b border-gray-400 uppercase tracking-wide">
                        Work Experience
                    </h2>
                    <div className="space-y-3 mt-2">
                        {experienceSection.data.entries.map(entry => (
                            <div key={entry.id} className="resume-entry">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="text-sm font-bold text-gray-900">
                                        {entry.jobTitle}
                                    </h3>
                                    <span className="text-xs text-gray-600">
                                        {entry.startDate} -{' '}
                                        {entry.current
                                            ? 'Present'
                                            : entry.endDate}
                                    </span>
                                </div>
                                <p className="text-xs italic text-gray-700 mb-1">
                                    {entry.company}, {entry.location}
                                </p>
                                {entry.description && (
                                    <p className="text-xs text-gray-700 mb-1">
                                        {entry.description}
                                    </p>
                                )}
                                {entry.achievements &&
                                    entry.achievements.length > 0 && (
                                        <ul className="list-disc list-inside space-y-0.5 text-xs text-gray-700">
                                            {entry.achievements.map(
                                                (achievement, idx) => (
                                                    <li key={idx}>
                                                        {achievement}
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Education */}
            {educationSection && educationSection.data.entries.length > 0 && (
                <div className="resume-section mb-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-2 pb-1 border-b border-gray-400 uppercase tracking-wide">
                        Education
                    </h2>
                    <div className="space-y-2 mt-2">
                        {educationSection.data.entries.map(entry => (
                            <div key={entry.id}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="text-sm font-bold text-gray-900">
                                        {entry.degree}
                                    </h3>
                                    <span className="text-xs text-gray-600">
                                        {entry.startDate} -{' '}
                                        {entry.current
                                            ? 'Present'
                                            : entry.endDate}
                                    </span>
                                </div>
                                <p className="text-xs italic text-gray-700">
                                    {entry.institution}, {entry.location}
                                </p>
                                {entry.gpa && (
                                    <p className="text-xs text-gray-700">
                                        GPA: {entry.gpa}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Skills */}
            {skillsSection && skillsSection.data.categories.length > 0 && (
                <div className="resume-section mb-4">
                    <h2 className="text-lg font-bold text-gray-900 mb-2 pb-1 border-b border-gray-400 uppercase tracking-wide">
                        Skills
                    </h2>
                    <div className="space-y-1 mt-2">
                        {skillsSection.data.categories.map((category, index) => (
                            <div key={`skill-category-${index}`} className="flex gap-2">
                                <span className="font-bold text-gray-900 min-w-[100px] text-sm">
                                    {category.name}:
                                </span>
                                <span className="text-xs text-gray-700">
                                    {category.skills.join(', ')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
