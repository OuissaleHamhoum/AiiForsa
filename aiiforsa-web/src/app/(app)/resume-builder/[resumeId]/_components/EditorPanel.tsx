'use client';

/**
 * Editor Panel Component
 * Left panel of the resume editor with sections accordion and Add Content button
 * Features: Drag & drop reordering, real-time auto-save, section management
 */

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AIReviewDialog } from './AIReviewPanel';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type {
    AwardsSection,
    CertificationsSection,
    CoursesSection,
    CustomSection,
    EducationSection,
    ExperienceSection,
    LanguagesSection,
    LinksSection,
    ProfileSection,
    ProjectsSection,
    PublicationsSection,
    ReferencesSection,
    Resume,
    ResumeSection,
    SkillsSection,
    SummarySection,
    VolunteerSection,
} from '@/types/resume.types';
import {
    GripVertical,
    Plus,
    Trash2,
    Save,
    Check,
    Clock,
    Brain,
} from 'lucide-react';
import { useEffect, useState, useRef, useCallback } from 'react';
import { ResumeOnboarding } from './ResumeOnboarding';
import {
    AwardsSectionEditor,
    CertificationsSectionEditor,
    CoursesSectionEditor,
    CustomSectionEditor,
    EducationSectionEditor,
    ExperienceSectionEditor,
    LanguagesSectionEditor,
    LinksSectionEditor,
    ProfileSectionEditor,
    ProjectsSectionEditor,
    PublicationsSectionEditor,
    ReferencesSectionEditor,
    SkillsSectionEditor,
    SummarySectionEditor,
    VolunteerSectionEditor,
} from './sections';

interface EditorPanelProps {
    resume: Resume;
    onUpdateResume: (resume: Resume) => void;
    onDeleteSection: (sectionId: string) => void;
    onAddContent: () => void;
    isSaving?: boolean;
    saveStatus?: 'saved' | 'unsaved' | 'saving';
    onManualSave?: () => void;
    onReorderSections?: (sectionIds: string[]) => Promise<void>;
}

// Sortable section item component
function SortableSectionItem({
    section,
    index,
    isOpen,
    onToggle,
    getSectionTitle,
    getSectionCount,
    handleDeleteSection,
    renderSectionEditor,
}: {
    section: ResumeSection;
    index: number;
    isOpen: boolean;
    onToggle: () => void;
    getSectionTitle: (section: ResumeSection) => string;
    getSectionCount: (section: ResumeSection) => number;
    handleDeleteSection: (index: number) => void;
    renderSectionEditor: (
        section: ResumeSection,
        index: number,
    ) => React.ReactNode;
}) {
    const sectionId = section.id || `temp-${index}`;
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: sectionId });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const count = getSectionCount(section);

    return (
        <div ref={setNodeRef} style={style}>
            <AccordionItem
                value={`${(section.type || '').toLowerCase()}-${index}`}
                className="overflow-hidden rounded-lg border"
            >
                <AccordionTrigger
                    className="px-4 py-3 text-left hover:no-underline"
                    onClick={onToggle}
                >
                    <div className="flex flex-1 items-center gap-3">
                        <div
                            {...attributes}
                            {...listeners}
                            role="button"
                            aria-label="drag-handle"
                            tabIndex={-1}
                            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                            onClick={e => e.stopPropagation()}
                        >
                            <GripVertical className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold">
                                    {getSectionTitle(section)}
                                </span>
                                {count > 0 && (
                                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                        {count}
                                    </span>
                                )}
                            </div>
                        </div>
                        {(section.type || '').toLowerCase() !== 'profile' && (
                            <div
                                role="button"
                                aria-label={`delete-section-${index}`}
                                tabIndex={0}
                                className="rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                onClick={e => {
                                    e.stopPropagation();
                                    handleDeleteSection(index);
                                }}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDeleteSection(index);
                                    }
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                            </div>
                        )}
                    </div>
                </AccordionTrigger>
                <AccordionContent className="border-t border-slate-700/50 px-4 py-4">
                    <div className="space-y-4">
                        {renderSectionEditor(section, index)}
                    </div>
                </AccordionContent>
            </AccordionItem>
        </div>
    );
}

export function EditorPanel({
    resume,
    onUpdateResume,
    onDeleteSection,
    onAddContent,
    isSaving = false,
    saveStatus = 'saved',
    onManualSave,
    onReorderSections,
}: EditorPanelProps) {
    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    // Open all sections for imported resumes, just profile for new ones
    const [openSections, setOpenSections] = useState<string[]>(() => {
        if (resume.sections.length > 0) {
            // Find profile section index and open it, or open first section
            const profileIndex = resume.sections.findIndex(
                s => (s.type || '').toLowerCase() === 'profile',
            );
            const sectionToOpen = profileIndex >= 0 ? profileIndex : 0;
            return [
                `${(resume.sections[sectionToOpen].type || '').toLowerCase()}-${sectionToOpen}`,
            ];
        }
        // New resume - just open profile when it's created
        return ['profile-0'];
    });
    const [showOnboarding, setShowOnboarding] = useState(
        resume.sections.length === 0,
    );

    // Update open sections and onboarding when section count changes only
    // This prevents opening the profile section when editing another section
    const prevSectionCountRef = useRef<number>(0);
    useEffect(() => {
        // Run only when the number of sections changes (add/remove)
        if (prevSectionCountRef.current === resume.sections.length) {
            return;
        }

        if (resume.sections.length > 0) {
            const profileIndex = resume.sections.findIndex(
                s => (s.type || '').toLowerCase() === 'profile',
            );
            const sectionToOpen = profileIndex >= 0 ? profileIndex : 0;
            const newOpenSection = `${(resume.sections[sectionToOpen].type || '').toLowerCase()}-${sectionToOpen}`;

            setOpenSections(prev => {
                // Only change open sections if it's empty (initial mount) or we don't have the desired section
                if (
                    !prev ||
                    prev.length === 0 ||
                    !prev.includes(newOpenSection)
                ) {
                    return [newOpenSection];
                }
                return prev;
            });

            // Hide onboarding if we have sections
            setShowOnboarding(false);
        } else {
            setShowOnboarding(true);
        }

        prevSectionCountRef.current = resume.sections.length;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resume.sections.length]);

    const handleDragEnd = useCallback(
        async (event: DragEndEvent) => {
            const { active, over } = event;

            if (!over || active.id === over.id) {
                return;
            }

            const oldIndex = resume.sections.findIndex(
                s =>
                    (s.id || `temp-${resume.sections.indexOf(s)}`) ===
                    active.id,
            );
            const newIndex = resume.sections.findIndex(
                s => (s.id || `temp-${resume.sections.indexOf(s)}`) === over.id,
            );

            if (oldIndex !== -1 && newIndex !== -1) {
                const newSections = arrayMove(
                    resume.sections,
                    oldIndex,
                    newIndex,
                );

                // Update local state immediately for better UX
                onUpdateResume({
                    ...resume,
                    sections: newSections,
                    sectionOrder: newSections.map(s => s.type as any),
                    updatedAt: new Date().toISOString(),
                });

                // Sync order to backend if handler provided
                if (onReorderSections) {
                    const sectionIds = newSections
                        .filter(s => s.id)
                        .map((s, idx) => ({ id: s.id!, order: idx }));

                    try {
                        await onReorderSections(sectionIds.map(s => s.id));
                    } catch (error) {
                        // Handle error silently or show user notification
                    }
                }
            }
        },
        [resume, onUpdateResume, onReorderSections],
    );

    const getSectionTitle = useCallback((section: ResumeSection): string => {
        const type = (section.type || '').toLowerCase();
        if (type === 'custom') {
            return (section as CustomSection).title || 'Custom';
        }
        // Special handling for profile section
        if (type === 'profile') {
            return 'Personal Details';
        }
        // Capitalize and format section type
        return type.charAt(0).toUpperCase() + type.slice(1);
    }, []);

    const getSectionCount = (section: ResumeSection): number => {
        // Return count of entries for sections that support multiple entries
        if ('data' in section && 'entries' in section.data) {
            return (section.data as any).entries?.length || 0;
        }
        return 0;
    };

    const handleDeleteSection = useCallback(
        (index: number) => {
            const sectionToDelete = resume.sections[index];
            if (sectionToDelete.id) {
                onDeleteSection(sectionToDelete.id);
            }
            const newSections = resume.sections.filter((_, i) => i !== index);
            onUpdateResume({
                ...resume,
                sections: newSections,
                sectionOrder: resume.sectionOrder.filter(
                    type =>
                        type.toLowerCase() !==
                        (resume.sections[index].type || '').toLowerCase(),
                ),
            });
        },
        [resume, onDeleteSection, onUpdateResume],
    );

    const handleUpdateSection = useCallback(
        (index: number, updatedSection: ResumeSection) => {
            const newSections = [...resume.sections];
            newSections[index] = updatedSection;
            onUpdateResume({
                ...resume,
                sections: newSections,
                updatedAt: new Date().toISOString(),
            });
        },
        [resume, onUpdateResume],
    );

    const handleOnboardingSkip = () => {
        // Add empty profile section without full name
        const profileSection: ProfileSection = {
            type: 'profile',
            data: {
                name: '',
                email: '',
                phone: '',
                location: '',
            },
        };

        onUpdateResume({
            ...resume,
            sections: [profileSection],
            sectionOrder: ['profile'],
            updatedAt: new Date().toISOString(),
        });

        setOpenSections(['profile-0']);
        setShowOnboarding(false);
    };

    const handleOnboardingSaveFullName = (name: string) => {
        // Add profile section with full name
        const profileSection: ProfileSection = {
            type: 'profile',
            data: {
                name,
                email: '',
                phone: '',
                location: '',
            },
        };

        onUpdateResume({
            ...resume,
            sections: [profileSection],
            sectionOrder: ['profile'],
            updatedAt: new Date().toISOString(),
        });

        setOpenSections(['profile-0']);
        setShowOnboarding(false);
    };

    const renderSectionEditor = (section: ResumeSection, index: number) => {
        // Use normalized lowercase type for consistency
        const type = (section.type || '').toLowerCase();

        switch (type) {
            case 'profile':
                return (
                    <ProfileSectionEditor
                        section={section as ProfileSection}
                        onChange={updated =>
                            handleUpdateSection(index, updated)
                        }
                    />
                );
            case 'summary':
                return (
                    <SummarySectionEditor
                        section={section as SummarySection}
                        onChange={updated =>
                            handleUpdateSection(index, updated)
                        }
                    />
                );
            case 'links':
                return (
                    <LinksSectionEditor
                        section={section as LinksSection}
                        onChange={updated =>
                            handleUpdateSection(index, updated)
                        }
                    />
                );
            case 'experience':
                return (
                    <ExperienceSectionEditor
                        section={section as ExperienceSection}
                        onChange={updated =>
                            handleUpdateSection(index, updated)
                        }
                    />
                );
            case 'education':
                return (
                    <EducationSectionEditor
                        section={section as EducationSection}
                        onChange={updated =>
                            handleUpdateSection(index, updated)
                        }
                    />
                );
            case 'skills':
                return (
                    <SkillsSectionEditor
                        section={section as SkillsSection}
                        onChange={updated =>
                            handleUpdateSection(index, updated)
                        }
                    />
                );
            case 'certifications':
                return (
                    <CertificationsSectionEditor
                        section={section as CertificationsSection}
                        onChange={updated =>
                            handleUpdateSection(index, updated)
                        }
                    />
                );
            case 'projects':
                return (
                    <ProjectsSectionEditor
                        section={section as ProjectsSection}
                        onChange={updated =>
                            handleUpdateSection(index, updated)
                        }
                    />
                );
            case 'languages':
                return (
                    <LanguagesSectionEditor
                        section={section as LanguagesSection}
                        onChange={updated =>
                            handleUpdateSection(index, updated)
                        }
                    />
                );
            case 'awards':
                return (
                    <AwardsSectionEditor
                        section={section as AwardsSection}
                        onChange={updated =>
                            handleUpdateSection(index, updated)
                        }
                    />
                );
            case 'publications':
                return (
                    <PublicationsSectionEditor
                        section={section as PublicationsSection}
                        onChange={updated =>
                            handleUpdateSection(index, updated)
                        }
                    />
                );
            case 'volunteer':
                return (
                    <VolunteerSectionEditor
                        section={section as VolunteerSection}
                        onChange={updated =>
                            handleUpdateSection(index, updated)
                        }
                    />
                );
            case 'courses':
                return (
                    <CoursesSectionEditor
                        section={section as CoursesSection}
                        onChange={updated =>
                            handleUpdateSection(index, updated)
                        }
                    />
                );
            case 'references':
                return (
                    <ReferencesSectionEditor
                        section={section as ReferencesSection}
                        onChange={updated =>
                            handleUpdateSection(index, updated)
                        }
                    />
                );
            case 'custom':
                return (
                    <CustomSectionEditor
                        section={section as CustomSection}
                        onChange={updated =>
                            handleUpdateSection(index, updated)
                        }
                    />
                );
            default:
                return (
                    <p className="text-sm text-slate-400">
                        Editor for {getSectionTitle(section)} coming soon.
                    </p>
                );
        }
    };

    return (
        <div className="flex h-full flex-col">
            {showOnboarding ? (
                <ResumeOnboarding
                    onSkip={handleOnboardingSkip}
                    onSaveFullName={handleOnboardingSaveFullName}
                />
            ) : (
                <ScrollArea className="flex-1">
                    {/* Header */}
                    <div className="border-b border-border bg-card px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="mb-1 text-xl font-bold">
                                    {resume.title}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Last updated:{' '}
                                    {new Date(
                                        resume.updatedAt,
                                    ).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                {/* AI Review Button */}
                                <AIReviewDialog resume={resume}>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="gap-2"
                                    >
                                        <Brain className="h-4 w-4" />
                                        AI Review
                                    </Button>
                                </AIReviewDialog>

                                {/* Save Status */}
                                <div className="flex items-center gap-2 text-sm">
                                    {saveStatus === 'saving' && (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-muted-foreground border-t-transparent"></div>
                                            <span className="text-muted-foreground">
                                                Saving...
                                            </span>
                                        </>
                                    )}
                                    {saveStatus === 'saved' && (
                                        <>
                                            <Check className="h-4 w-4 text-green-600" />
                                            <span className="text-green-600">
                                                Saved
                                            </span>
                                        </>
                                    )}
                                    {saveStatus === 'unsaved' && (
                                        <>
                                            <Clock className="h-4 w-4 text-orange-600" />
                                            <span className="text-orange-600">
                                                Unsaved
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* Manual Save Button */}
                                {saveStatus === 'unsaved' && onManualSave && (
                                    <Button
                                        onClick={onManualSave}
                                        size="sm"
                                        className="bg-primary hover:bg-primary/90"
                                        disabled={isSaving}
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Save Now
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sections List */}
                    <div className="p-4">
                        {resume.sections.length === 0 ? (
                            <div className="py-12 text-center">
                                <p className="mb-4 text-slate-400">
                                    No sections added yet. Click &quot;Add
                                    Content&quot; to get started.
                                </p>
                            </div>
                        ) : (
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={resume.sections.map(
                                        (s, i) => `section-${i}`,
                                    )}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <Accordion
                                        type="single"
                                        value={openSections[0] || ''}
                                        onValueChange={value =>
                                            setOpenSections(
                                                value ? [value] : [],
                                            )
                                        }
                                        collapsible
                                        className="space-y-2"
                                    >
                                        {resume.sections.map(
                                            (section, index) => (
                                                <SortableSectionItem
                                                    key={`section-${index}`}
                                                    section={section}
                                                    index={index}
                                                    isOpen={
                                                        openSections[0] ===
                                                        `${(section.type || '').toLowerCase()}-${index}`
                                                    }
                                                    onToggle={() => {
                                                        const value = `${(section.type || '').toLowerCase()}-${index}`;
                                                        setOpenSections(
                                                            openSections[0] ===
                                                                value
                                                                ? []
                                                                : [value],
                                                        );
                                                    }}
                                                    getSectionTitle={
                                                        getSectionTitle
                                                    }
                                                    getSectionCount={
                                                        getSectionCount
                                                    }
                                                    handleDeleteSection={
                                                        handleDeleteSection
                                                    }
                                                    renderSectionEditor={
                                                        renderSectionEditor
                                                    }
                                                />
                                            ),
                                        )}
                                    </Accordion>
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>

                    {/* Add Content Button */}
                    <div className="p-4">
                        <Button
                            onClick={onAddContent}
                            className="w-full bg-gradient-to-r from-[#8a3a2d] to-[#753a83] text-white hover:opacity-90"
                            size="lg"
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            Add Content
                        </Button>
                    </div>
                </ScrollArea>
            )}
        </div>
    );
}
