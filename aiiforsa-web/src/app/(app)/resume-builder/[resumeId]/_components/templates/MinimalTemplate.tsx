'use client';

/**
 * Minimal Resume Template
 * Simple and clean with maximum readability
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

export function MinimalTemplate({ resume }: TemplateProps) {
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
        <div className="a4-page w-[210mm] min-h-[297mm] p-10 text-gray-900 font-sans bg-white">
            {/* Minimal Header */}
            <div className="resume-header mb-8">
                <h1 className="text-2xl font-light text-gray-900 mb-2">
                    {profileSection?.data.name || 'Your Name'}
                </h1>
                {profileSection?.data.professionalTitle && (
                    <h2 className="text-lg font-light text-gray-600 mb-3">
                        {profileSection.data.professionalTitle}
                    </h2>
                )}
                <div className="flex gap-3 text-xs text-gray-600 font-light">
                    {profileSection?.data.email && (
                        <span>{profileSection.data.email}</span>
                    )}
                    {profileSection?.data.phone && (
                        <span>{profileSection.data.phone}</span>
                    )}
                    {profileSection?.data.location && (
                        <span>{profileSection.data.location}</span>
                    )}
                </div>
            </div>

            {/* Professional Summary */}
            {profileSection?.data.summary && (
                <div className="resume-section mb-8">
                    <h2 className="text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wider">
                        About
                    </h2>
                    <p className="text-xs leading-relaxed text-gray-700 font-light">
                        {profileSection.data.summary}
                    </p>
                </div>
            )}

            {/* Work Experience */}
            {experienceSection && experienceSection.data.entries.length > 0 && (
                <div className="resume-section mb-8">
                    <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
                        Experience
                    </h2>
                    <div className="space-y-5">
                        {experienceSection.data.entries.map(entry => (
                            <div key={entry.id} className="resume-entry">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="text-sm font-medium text-gray-900">
                                        {entry.jobTitle}
                                    </h3>
                                    <span className="text-xs text-gray-500 font-light">
                                        {entry.startDate} —{' '}
                                        {entry.current
                                            ? 'Present'
                                            : entry.endDate}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 mb-1 font-light">
                                    {entry.company} · {entry.location}
                                </p>
                                {entry.description && (
                                    <p className="text-xs text-gray-700 mb-1 font-light">
                                        {entry.description}
                                    </p>
                                )}
                                {entry.achievements &&
                                    entry.achievements.length > 0 && (
                                        <ul className="space-y-0.5 text-xs text-gray-700 font-light">
                                            {entry.achievements.map(
                                                (achievement, idx) => (
                                                    <li
                                                        key={idx}
                                                        className="pl-3 relative before:content-['—'] before:absolute before:left-0"
                                                    >
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
                <div className="resume-section mb-8">
                    <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
                        Education
                    </h2>
                    <div className="space-y-3">
                        {educationSection.data.entries.map(entry => (
                            <div key={entry.id}>
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="text-sm font-medium text-gray-900">
                                        {entry.degree}
                                    </h3>
                                    <span className="text-xs text-gray-500 font-light">
                                        {entry.startDate} —{' '}
                                        {entry.current
                                            ? 'Present'
                                            : entry.endDate}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-600 font-light">
                                    {entry.institution} · {entry.location}
                                </p>
                                {entry.gpa && (
                                    <p className="text-xs text-gray-700 font-light">
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
                <div className="resume-section mb-8">
                    <h2 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
                        Skills
                    </h2>
                    <div className="space-y-2">
                        {skillsSection.data.categories.map((category, index) => (
                            <div key={`skill-category-${index}`}>
                                <h3 className="text-sm font-medium text-gray-900 mb-1">
                                    {category.name}
                                </h3>
                                <p className="text-xs text-gray-700 font-light">
                                    {category.skills.join(' · ')}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
