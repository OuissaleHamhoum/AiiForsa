'use client';

/**
 * Modern Resume Template
 * Clean and contemporary design with gradient accent
 */

import type {
    Resume,
    ProfileSection,
    ExperienceSection,
    EducationSection,
    SkillsSection,
    LanguagesSection,
    CertificationsSection,
    AwardsSection,
    VolunteerSection,
    ProjectsSection,
    PublicationsSection,
    CoursesSection,
} from '@/types/resume.types';

interface TemplateProps {
    resume: Resume;
}

export function ModernTemplate({ resume }: TemplateProps) {
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
    const languagesSection = resume.sections.find(
        s => s.type === 'languages',
    ) as LanguagesSection | undefined;
    const certificationsSection = resume.sections.find(
        s => s.type === 'certifications',
    ) as CertificationsSection | undefined;
    const awardsSection = resume.sections.find(s => s.type === 'awards') as
        | AwardsSection
        | undefined;
    const volunteerSection = resume.sections.find(
        s => s.type === 'volunteer',
    ) as VolunteerSection | undefined;
    const projectsSection = resume.sections.find(s => s.type === 'projects') as
        | ProjectsSection
        | undefined;
    const publicationsSection = resume.sections.find(
        s => s.type === 'publications',
    ) as PublicationsSection | undefined;
    const coursesSection = resume.sections.find(s => s.type === 'courses') as
        | CoursesSection
        | undefined;

    return (
        <div className="a4-page w-[210mm] min-h-[297mm] p-10 text-gray-900 font-['Inter'] bg-white leading-tight">
            {/* Header */}
            <div className="resume-header mb-8">
                <h1 className="text-[28px] font-bold text-gray-900 mb-2 tracking-tight">
                    {profileSection?.data.name || 'Your Name'}
                </h1>
                {profileSection?.data.professionalTitle && (
                    <h2 className="text-[16px] font-medium text-blue-600 mb-4">
                        {profileSection.data.professionalTitle}
                    </h2>
                )}
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-gray-600">
                    {profileSection?.data.email && (
                        <span key="email" className="flex items-center gap-2">
                            <span className="font-medium">Email:</span>
                            {profileSection.data.email}
                        </span>
                    )}
                    {profileSection?.data.phone && (
                        <span key="phone" className="flex items-center gap-2">
                            <span className="font-medium">Phone:</span>
                            {profileSection.data.phone}
                        </span>
                    )}
                    {profileSection?.data.location && (
                        <span
                            key="location"
                            className="flex items-center gap-2"
                        >
                            <span className="font-medium">Location:</span>
                            {profileSection.data.location}
                        </span>
                    )}
                </div>
            </div>

            {/* Professional Summary */}
            {profileSection?.data.summary && (
                <div className="resume-section mb-8">
                    <h2 className="text-[16px] font-semibold text-gray-900 mb-3 uppercase tracking-wide border-b border-gray-200 pb-1">
                        Professional Summary
                    </h2>
                    <p className="text-[11px] leading-relaxed text-gray-700">
                        {profileSection.data.summary}
                    </p>
                </div>
            )}

            {/* Work Experience */}
            {experienceSection && experienceSection.data.entries.length > 0 && (
                <div className="resume-section mb-8">
                    <h2 className="text-[16px] font-semibold text-gray-900 mb-4 uppercase tracking-wide border-b border-gray-200 pb-1">
                        Work Experience
                    </h2>
                    <div className="space-y-6">
                        {experienceSection.data.entries.map(entry => (
                            <div
                                key={entry.id}
                                className="resume-entry relative"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <h3 className="text-[14px] font-semibold text-gray-900">
                                            {entry.jobTitle}
                                        </h3>
                                        <p className="text-[11px] text-blue-600 font-medium mt-1">
                                            {entry.company} • {entry.location}
                                        </p>
                                    </div>
                                    <div className="text-[11px] text-gray-600 font-medium ml-4">
                                        {entry.startDate} -{' '}
                                        {entry.current
                                            ? 'Present'
                                            : entry.endDate}
                                    </div>
                                </div>
                                {entry.description && (
                                    <p className="text-[11px] text-gray-700 mb-3 leading-relaxed">
                                        {entry.description}
                                    </p>
                                )}
                                {entry.achievements &&
                                    entry.achievements.length > 0 && (
                                        <ul className="space-y-1">
                                            {entry.achievements.map(
                                                (achievement, idx) => (
                                                    <li
                                                        key={idx}
                                                        className="text-[11px] text-gray-700 flex items-start"
                                                    >
                                                        <span className="text-blue-600 mr-2 mt-1.5 text-[11px]">
                                                            •
                                                        </span>
                                                        <span className="leading-relaxed">
                                                            {achievement}
                                                        </span>
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
                <div className="resume-section mb-6">
                    <h2 className="text-[16px] font-semibold text-gray-900 mb-4 uppercase tracking-wide border-b border-gray-200 pb-1">
                        Education
                    </h2>
                    <div className="space-y-3 pl-3">
                        {educationSection.data.entries.map(entry => (
                            <div key={entry.id}>
                                <div className="flex justify-between items-start mb-1">
                                    <div>
                                        <h3 className="text-[14px] font-semibold text-gray-900">
                                            {entry.degree}
                                        </h3>
                                        <p className="text-[11px] text-blue-600 font-medium">
                                            {entry.institution} •{' '}
                                            {entry.location}
                                        </p>
                                    </div>
                                    <div className="text-[11px] text-gray-600 font-medium">
                                        {entry.startDate} -{' '}
                                        {entry.current
                                            ? 'Present'
                                            : entry.endDate}
                                    </div>
                                </div>
                                {entry.gpa && (
                                    <p className="text-[11px] text-gray-700">
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
                    <h2 className="text-[16px] font-semibold text-gray-900 mb-4 uppercase tracking-wide border-b border-gray-200 pb-1">
                        Skills
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                        {skillsSection.data.categories.map((category) => (
                            <div key={category.id}>
                                <h3 className="font-semibold text-gray-900 mb-1 text-[14px]">
                                    {category.name}
                                </h3>
                                <p className="text-[11px] text-gray-700">
                                    {category.skills.join(' • ')}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Languages */}
            {languagesSection && languagesSection.data.entries.length > 0 && (
                <div className="resume-section mb-8">
                    <h2 className="text-[16px] font-semibold text-gray-900 mb-4 uppercase tracking-wide border-b border-gray-200 pb-1">
                        Languages
                    </h2>
                    <div className="space-y-2">
                        {languagesSection.data.entries.map(language => (
                            <div
                                key={language.id}
                                className="flex justify-between items-center"
                            >
                                <span className="font-medium text-gray-900 text-[14px]">
                                    {language.language}
                                </span>
                                <span className="text-[11px] text-gray-600">
                                    {language.proficiency}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Projects */}
            {projectsSection && projectsSection.data.entries.length > 0 && (
                <div className="resume-section mb-8">
                    <h2 className="text-[16px] font-semibold text-gray-900 mb-4 uppercase tracking-wide border-b border-gray-200 pb-1">
                        Projects
                    </h2>
                    <div className="space-y-6">
                        {projectsSection.data.entries.map(project => (
                            <div
                                key={project.id}
                                className="resume-entry relative"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <h3 className="text-[14px] font-semibold text-gray-900">
                                            {project.name}
                                        </h3>
                                        <p className="text-[11px] text-blue-600 font-medium mt-1">
                                            {project.technologies.join(' • ')}
                                        </p>
                                    </div>
                                    <div className="text-[11px] text-gray-600 font-medium ml-4">
                                        {project.startDate} -{' '}
                                        {project.current
                                            ? 'Present'
                                            : project.endDate}
                                    </div>
                                </div>
                                {project.description && (
                                    <p className="text-[11px] text-gray-700 mb-3 leading-relaxed">
                                        {project.description}
                                    </p>
                                )}
                                {project.highlights &&
                                    project.highlights.length > 0 && (
                                        <ul className="space-y-1">
                                            {project.highlights.map(
                                                (highlight, idx) => (
                                                    <li
                                                        key={idx}
                                                        className="text-[11px] text-gray-700 flex items-start"
                                                    >
                                                        <span className="text-blue-600 mr-2 mt-1.5 text-[11px]">
                                                            •
                                                        </span>
                                                        <span className="leading-relaxed">
                                                            {highlight}
                                                        </span>
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    )}
                                {project.url && (
                                    <p className="text-[11px] text-blue-600 mt-2">
                                        {project.url}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Certifications */}
            {certificationsSection &&
                certificationsSection.data.entries.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-[16px] font-semibold text-gray-900 mb-4 uppercase tracking-wide border-b border-gray-200 pb-1">
                            Certifications
                        </h2>
                        <div className="space-y-3">
                            {certificationsSection.data.entries.map(cert => (
                                <div key={cert.id}>
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <h3 className="text-[14px] font-semibold text-gray-900">
                                                {cert.name}
                                            </h3>
                                            <p className="text-[11px] text-blue-600 font-medium">
                                                {cert.issuer}
                                            </p>
                                        </div>
                                        <div className="text-[11px] text-gray-600 font-medium">
                                            {cert.date}
                                            {cert.expiryDate &&
                                                ` - ${cert.expiryDate}`}
                                        </div>
                                    </div>
                                    {cert.credentialId && (
                                        <p className="text-[11px] text-gray-700">
                                            ID: {cert.credentialId}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            {/* Awards */}
            {awardsSection && awardsSection.data.entries.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-[16px] font-semibold text-gray-900 mb-4 uppercase tracking-wide border-b border-gray-200 pb-1">
                        Awards & Honors
                    </h2>
                    <div className="space-y-3">
                        {awardsSection.data.entries.map(award => (
                            <div key={award.id}>
                                <div className="flex justify-between items-start mb-1">
                                    <div>
                                        <h3 className="text-[14px] font-semibold text-gray-900">
                                            {award.title}
                                        </h3>
                                        <p className="text-[11px] text-blue-600 font-medium">
                                            {award.issuer}
                                        </p>
                                    </div>
                                    <div className="text-[11px] text-gray-600 font-medium">
                                        {award.date}
                                    </div>
                                </div>
                                {award.description && (
                                    <p className="text-[11px] text-gray-700 leading-relaxed">
                                        {award.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Volunteer Experience */}
            {volunteerSection && volunteerSection.data.entries.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-[16px] font-semibold text-gray-900 mb-4 uppercase tracking-wide border-b border-gray-200 pb-1">
                        Volunteer Experience
                    </h2>
                    <div className="space-y-6">
                        {volunteerSection.data.entries.map(entry => (
                            <div key={entry.id} className="relative">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex-1">
                                        <h3 className="text-[14px] font-semibold text-gray-900">
                                            {entry.role}
                                        </h3>
                                        <p className="text-[11px] text-blue-600 font-medium mt-1">
                                            {entry.organization} •{' '}
                                            {entry.location}
                                        </p>
                                    </div>
                                    <div className="text-[11px] text-gray-600 font-medium ml-4">
                                        {entry.startDate} -{' '}
                                        {entry.current
                                            ? 'Present'
                                            : entry.endDate}
                                    </div>
                                </div>
                                {entry.description && (
                                    <p className="text-[11px] text-gray-700 mb-3 leading-relaxed">
                                        {entry.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Publications */}
            {publicationsSection &&
                publicationsSection.data.entries.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-[16px] font-semibold text-gray-900 mb-4 uppercase tracking-wide border-b border-gray-200 pb-1">
                            Publications
                        </h2>
                        <div className="space-y-3">
                            {publicationsSection.data.entries.map(pub => (
                                <div key={pub.id}>
                                    <h3 className="text-[14px] font-semibold text-gray-900 mb-1">
                                        {pub.title}
                                    </h3>
                                    <p className="text-[11px] text-blue-600 font-medium mb-1">
                                        {pub.publisher}
                                    </p>
                                    <p className="text-[11px] text-gray-600">
                                        {pub.date}
                                    </p>
                                    {pub.url && (
                                        <p className="text-[11px] text-blue-600 mt-1">
                                            {pub.url}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            {/* Courses */}
            {coursesSection && coursesSection.data.entries.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-[16px] font-semibold text-gray-900 mb-4 uppercase tracking-wide border-b border-gray-200 pb-1">
                        Courses
                    </h2>
                    <div className="space-y-3">
                        {coursesSection.data.entries.map(course => (
                            <div key={course.id}>
                                <div className="flex justify-between items-start mb-1">
                                    <div>
                                        <h3 className="text-[14px] font-semibold text-gray-900">
                                            {course.name}
                                        </h3>
                                        <p className="text-[11px] text-blue-600 font-medium">
                                            {course.institution}
                                        </p>
                                    </div>
                                    <div className="text-[11px] text-gray-600 font-medium">
                                        {course.date}
                                    </div>
                                </div>
                                {course.description && (
                                    <p className="text-[11px] text-gray-700 leading-relaxed">
                                        {course.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
