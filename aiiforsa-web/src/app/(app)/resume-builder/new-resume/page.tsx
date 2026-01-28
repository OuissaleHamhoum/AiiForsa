'use client';

/**
 * New Resume Page
 * Page for creating a new resume with template selection
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Star, Upload, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { parseResumeWithQwen, createResume } from '@/actions/resume-actions';
import type { Resume, ResumeSection } from '@/types/resume.types';

const createResumeFromParsedData = (
    resumeId: string,
    parsedData: any,
): Resume => {
    const sections: ResumeSection[] = [];
    const sectionOrder: Resume['sectionOrder'] = [];

    // Extract personal information
    const personalInfo = parsedData.personalInformation || parsedData;

    // Extract profile information
    if (personalInfo.fullName || personalInfo.email || personalInfo.phone) {
        const profileData = {
            name: personalInfo.fullName || personalInfo.name || 'Unknown Name',
            professionalTitle:
                personalInfo.title ||
                personalInfo.position ||
                personalInfo.professionalTitle,
            email: personalInfo.email || '',
            phone: personalInfo.phone || '',
            location: personalInfo.location || personalInfo.address || '',
            summary: personalInfo.summary || personalInfo.objective || '',
        };
        sections.push({
            type: 'profile',
            data: profileData,
        });
        sectionOrder.push('profile');
    }

    // Extract summary if available and different from profile summary
    const profileSummary = personalInfo.summary || personalInfo.objective || '';
    if (parsedData.summary && parsedData.summary !== profileSummary) {
        sections.push({
            type: 'summary',
            data: {
                content: parsedData.summary,
            },
        });
        sectionOrder.push('summary');
    }

    // Extract experience
    if (parsedData.workExperience && Array.isArray(parsedData.workExperience)) {
        const experienceData = parsedData.workExperience.map((exp: any) => {
            // Handle description - can be array or string
            let description = '';
            if (Array.isArray(exp.description)) {
                description = exp.description.join('\n• ');
                if (description) {
                    description = '• ' + description; // Add bullet to first item
                }
            } else if (
                exp.responsibilities &&
                Array.isArray(exp.responsibilities)
            ) {
                description = exp.responsibilities.join('\n• ');
                if (description) {
                    description = '• ' + description;
                }
            } else {
                description =
                    exp.description ||
                    exp.responsibilities ||
                    exp.summary ||
                    '';
            }

            return {
                company: exp.company || exp.organization || '',
                position: exp.position || exp.title || exp.jobTitle || '',
                location: exp.location || '',
                startDate: exp.startDate || exp.start_date || '',
                endDate: exp.endDate || exp.end_date || '',
                current: exp.current || exp.isCurrent || false,
                description,
            };
        });

        const experienceEntries = experienceData.map((exp: any) => ({
            id: uuidv4(),
            jobTitle: exp.position,
            company: exp.company,
            location: exp.location,
            startDate: exp.startDate,
            endDate: exp.current ? null : exp.endDate,
            current: exp.current,
            description: exp.description,
            achievements: [],
        }));

        const experienceSection = {
            type: 'experience' as const,
            data: {
                entries: experienceEntries,
            },
        };

        sections.push(experienceSection);
        sectionOrder.push('experience');
    }

    // Extract education
    if (parsedData.education && Array.isArray(parsedData.education)) {
        sections.push({
            type: 'education',
            data: {
                entries: Array.isArray(parsedData.education)
                    ? parsedData.education.map((edu: any) => ({
                          id: uuidv4(),
                          institution:
                              edu.institution ||
                              edu.school ||
                              edu.university ||
                              edu.organization ||
                              '',
                          degree:
                              edu.degree ||
                              edu.qualification ||
                              edu.level ||
                              '',
                          location: edu.location || '',
                          startDate: edu.startDate || edu.start_date || '',
                          endDate:
                              edu.current || edu.isCurrent
                                  ? null
                                  : edu.endDate || edu.end_date || '',
                          current: edu.current || edu.isCurrent || false,
                          gpa: edu.gpa || '',
                          description: edu.description || '',
                          achievements: [],
                      }))
                    : [],
            },
        });
        sectionOrder.push('education');
    }

    // Extract skills
    if (parsedData.skills && Array.isArray(parsedData.skills)) {
        const skillsArray = parsedData.skills.map((skill: any) =>
            typeof skill === 'string'
                ? skill
                : skill.name || skill.skill || skill.title || '',
        );

        sections.push({
            type: 'skills',
            data: {
                categories: [
                    {
                        id: uuidv4(),
                        name: 'Technical Skills',
                        skills: skillsArray,
                    },
                ],
            },
        });
        sectionOrder.push('skills');
    }

    // Extract certifications
    if (
        parsedData.certifications &&
        Array.isArray(parsedData.certifications) &&
        parsedData.certifications.length > 0
    ) {
        sections.push({
            type: 'certifications',
            data: {
                entries: parsedData.certifications.map((cert: any) => ({
                    id: uuidv4(),
                    name:
                        cert.name ||
                        cert.certification ||
                        cert.certificationName ||
                        cert.title ||
                        '',
                    issuer:
                        cert.issuer ||
                        cert.organization ||
                        cert.issuingOrganization ||
                        '',
                    date:
                        cert.date ||
                        cert.issueDate ||
                        cert.issue_date ||
                        cert.dateObtained ||
                        '',
                    expiryDate:
                        cert.expiryDate ||
                        cert.expirationDate ||
                        cert.expiry_date ||
                        cert.expiration_date ||
                        '',
                    credentialId:
                        cert.credentialId ||
                        cert.credential_id ||
                        cert.id ||
                        '',
                    credentialUrl: cert.url || cert.credentialUrl || '',
                })),
            },
        });
        sectionOrder.push('certifications');
    }

    // Extract projects
    if (
        parsedData.projects &&
        Array.isArray(parsedData.projects) &&
        parsedData.projects.length > 0
    ) {
        sections.push({
            type: 'projects',
            data: {
                entries: parsedData.projects.map((project: any) => ({
                    id: uuidv4(),
                    name:
                        project.name ||
                        project.title ||
                        project.projectName ||
                        '',
                    description: project.description || project.summary || '',
                    technologies:
                        project.technologies ||
                        project.tech_stack ||
                        project.tags ||
                        [],
                    startDate: project.startDate || project.start_date || '',
                    endDate: project.endDate || project.end_date || '',
                    current: project.current || project.isCurrent || false,
                    url: project.url || project.link || project.github || '',
                    githubUrl: '',
                    highlights: [],
                })),
            },
        });
        sectionOrder.push('projects');
    }

    // Extract languages
    if (parsedData.languages && Array.isArray(parsedData.languages)) {
        sections.push({
            type: 'languages',
            data: {
                entries: parsedData.languages.map((lang: any) => ({
                    id: uuidv4(),
                    language:
                        typeof lang === 'string'
                            ? lang
                            : lang.name || lang.language || '',
                    proficiency:
                        lang.proficiency ||
                        lang.level ||
                        lang.proficiencyLevel ||
                        'intermediate',
                })),
            },
        });
        sectionOrder.push('languages');
    }

    // Extract awards
    if (
        parsedData.awards &&
        Array.isArray(parsedData.awards) &&
        parsedData.awards.length > 0
    ) {
        sections.push({
            type: 'awards',
            data: {
                entries: parsedData.awards.map((award: any) => ({
                    id: uuidv4(),
                    title: award.title || award.awardName || '',
                    issuer: award.issuer || award.issuingOrganization || '',
                    date: award.date || award.dateReceived || '',
                    description: award.description || '',
                })),
            },
        });
        sectionOrder.push('awards');
    }

    // Extract volunteer experience
    if (
        parsedData.volunteerExperience &&
        Array.isArray(parsedData.volunteerExperience) &&
        parsedData.volunteerExperience.length > 0
    ) {
        sections.push({
            type: 'volunteer',
            data: parsedData.volunteerExperience.map((vol: any) => ({
                organization: vol.organization || '',
                role: vol.role || vol.position || '',
                location: vol.location || '',
                startDate: vol.startDate || vol.start_date || '',
                endDate: vol.endDate || vol.end_date || '',
                current: vol.current || vol.isCurrent || false,
                description: vol.description || '',
            })),
        });
        sectionOrder.push('volunteer');
    }

    return {
        id: resumeId,
        title: `Imported Resume - ${personalInfo.fullName || personalInfo.name || 'Untitled'}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        template: {
            id: 'modern-1',
            name: 'Modern Professional',
            style: 'modern',
            thumbnail: '/templates/modern-1.png',
            isPremium: false,
        },
        aiScore: 85, // Default score for imported resumes
        isPublic: false,
        sections,
        sectionOrder,
    };
};

export default function NewResumePage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isParsing, setIsParsing] = useState(false);

    const [isCreatingBlank, setIsCreatingBlank] = useState(false);

    const handleCreateBlank = async () => {
        setIsCreatingBlank(true);
        try {
            const result = await createResume({
                title: 'Untitled Resume',
                data: {
                    sections: [],
                    sectionOrder: [],
                    template: {
                        id: 'modern-1',
                        name: 'Modern Professional',
                        style: 'modern',
                        thumbnail: '/templates/modern-1.png',
                        isPremium: false,
                    },
                    aiScore: 0,
                    isPublic: false,
                },
            });

            if (result.success && result.data) {
                router.push(`/resume-builder/${result.data.id}`);
            } else {
                alert(result.error || 'Failed to create blank resume.');
            }
        } catch (_error) {
            alert('Failed to create blank resume.');
        } finally {
            setIsCreatingBlank(false);
        }
    };

    const handleImportClick = () => {
        // open the hidden file input
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.currentTarget;
        const file = e.target.files?.[0];
        if (!file) return;

        // File size validation (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            alert(
                'File size must be less than 10MB. Please choose a smaller file.',
            );
            target.value = '';
            return;
        }

        // Basic validation: allow only PDF
        const allowedTypes = ['application/pdf'];

        const isAllowedType =
            allowedTypes.includes(file.type) ||
            file.name.toLowerCase().endsWith('.pdf');

        if (!isAllowedType) {
            alert('Please select a PDF file.');
            target.value = '';
            return;
        }

        setIsParsing(true);

        try {
            // Parse CV using backend API
            const parseResult = await parseResumeWithQwen(file);

            if (!parseResult.success || !parseResult.data) {
                throw new Error(parseResult.error || 'CV parsing failed');
            }

            const { display: displayMd, json: parsedJsonData } =
                parseResult.data;

            if (!parsedJsonData) {
                // Backend returned an error
                throw new Error(displayMd || 'CV parsing failed on the server');
            }

            // Check if parsing was successful
            if (!parsedJsonData || Object.keys(parsedJsonData).length === 0) {
                throw new Error('CV parsing returned empty data');
            }

            // Convert parsed data to Resume structure for frontend use
            const parsedResume = createResumeFromParsedData(
                uuidv4(),
                parsedJsonData,
            );

            // Create resume in backend with RAW parsed JSON (not transformed)
            // This preserves the original CV structure for AI operations
            const result = await createResume({
                title: parsedResume.title,
                data: parsedJsonData, // ✅ Save raw parsed JSON for AI compatibility
            });

            if (result.success && result.data) {
                // Navigate directly to the editor
                router.push(`/resume-builder/${result.data.id}`);
            } else {
                throw new Error(
                    result.error || 'Failed to save imported resume',
                );
            }
        } catch (error) {
            // Enhanced error handling
            let errorMessage = 'Failed to parse CV. Please try again.';

            if (error instanceof Error) {
                if (
                    error.message.includes('connect') ||
                    error.message.includes('ECONNREFUSED')
                ) {
                    errorMessage =
                        'Cannot connect to CV parser service. Please ensure the backend is running.';
                } else if (
                    error.message.includes('timeout') ||
                    error.message.includes('ETIMEDOUT')
                ) {
                    errorMessage =
                        'Request timed out. The file might be too large or complex.';
                } else if (error.message.includes('Invalid CV data')) {
                    errorMessage =
                        'The PDF could not be parsed. Please ensure it contains readable text and is not password-protected.';
                } else if (error.message.includes('empty data')) {
                    errorMessage =
                        'No data was extracted from the PDF. The file may be scanned or image-based.';
                } else {
                    errorMessage = `Failed to parse PDF: ${error.message}`;
                }
            }

            alert(errorMessage);
        } finally {
            setIsParsing(false);
            target.value = '';
        }
    };

    return (
        <>
            <div className="mx-auto max-w-3/4 px-4 py-12 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
                        Create a New Resume
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-[#90A1B9]">
                        Start with a blank resume or import your existing resume
                        from a PDF file
                    </p>
                </div>

                <div className="flex gap-20">
                    {/* Quick Actions */}
                    <div className="mb-12">
                        <div className="flex flex-col gap-6 min-w-72">
                            {/* New Blank Resume */}
                            <Card
                                className={`group h-52 cursor-pointer border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:scale-105 hover:border-white/20 hover:bg-white/10 ${
                                    isCreatingBlank
                                        ? 'pointer-events-none opacity-50'
                                        : ''
                                }`}
                                onClick={handleCreateBlank}
                            >
                                <CardContent className="flex flex-col items-center justify-center p-2 text-center">
                                    <div className="mb-4 rounded-full bg-button-accent p-4">
                                        {isCreatingBlank ? (
                                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                                        ) : (
                                            <Plus className="h-8 w-8 text-white" />
                                        )}
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold text-white">
                                        {isCreatingBlank
                                            ? 'Creating...'
                                            : 'New Blank'}
                                    </h3>
                                    <p className="text-sm text-[#90A1B9]">
                                        {isCreatingBlank
                                            ? 'Please wait while we create your resume'
                                            : 'Start from scratch with a blank canvas'}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Import Resume */}
                            <Card
                                className={`group h-52 cursor-pointer border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:scale-105 hover:border-white/20 hover:bg-white/10 ${
                                    isParsing
                                        ? 'pointer-events-none opacity-50'
                                        : ''
                                }`}
                                onClick={handleImportClick}
                            >
                                <CardContent className="flex flex-col items-center justify-center p-2 text-center">
                                    <div className="mb-4 rounded-full bg-white/10 p-4 transition-colors group-hover:bg-white/20">
                                        {isParsing ? (
                                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                                        ) : (
                                            <Upload className="h-8 w-8 text-white" />
                                        )}
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold text-white">
                                        {isParsing
                                            ? 'Parsing CV...'
                                            : 'Import Resume'}
                                    </h3>
                                    <p className="text-sm text-[#90A1B9]">
                                        {isParsing
                                            ? 'Please wait while we analyze your CV'
                                            : 'Upload your resume (PDF only)'}
                                    </p>
                                </CardContent>
                            </Card>
                            {/* Hidden file input used for importing resumes */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,application/pdf"
                                className="hidden"
                                onChange={handleFileChange}
                                disabled={isParsing}
                                aria-hidden
                            />

                            {/* AI Assistant */}
                            <Card className="group h-52 cursor-pointer border-white/10 bg-white/5 backdrop-blur-sm transition-all hover:scale-105 hover:border-white/20 hover:bg-white/10">
                                <CardContent className="flex flex-col items-center justify-center p-2 text-center">
                                    <div className="mb-4 rounded-full bg-white/10 p-4 transition-colors group-hover:bg-white/20">
                                        <Star className="h-8 w-8 text-white" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold text-white">
                                        AI Assistant
                                    </h3>
                                    <p className="text-sm text-[#90A1B9]">
                                        Get AI help to build your resume
                                    </p>
                                    <Badge className="mt-2 bg-button-accent">
                                        Coming Soon
                                    </Badge>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
