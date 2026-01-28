'use client';

/**
 * Resume Editor Client Component
 * Handles all interactive state and user interactions
 */

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { AddContentDialog } from './AddContentDialog';
import { EditorPanel } from './EditorPanel';
import { EnhancedPreviewPanel } from './EnhancedPreviewPanel';
import {
    createResumeSection,
    deleteResumeSection,
    updateResume,
    reorderResumeSections,
} from '@/actions/resume-actions';
import type { Resume, ResumeSection } from '@/types/resume.types';
import { useDebounce } from '@/hooks/use-debounce';
import { transformResumeToCV } from '@/lib/utils/resume-transform';

interface ResumeEditorClientProps {
    initialResume: Resume;
}

export function ResumeEditorClient({ initialResume }: ResumeEditorClientProps) {
    const [clientResume, setClientResume] = useState<Resume>(initialResume);
    const [isAddContentOpen, setIsAddContentOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<
        'saved' | 'unsaved' | 'saving'
    >('saved');

    // Debounce resume changes for auto-save (5 seconds for better UX)
    const debouncedResume = useDebounce(clientResume, 5000);

    // Auto-save when resume changes
    useEffect(() => {
        const saveResume = async () => {
            if (!debouncedResume.id) return;

            try {
                setIsSaving(true);
                setSaveStatus('saving');
                const cvTemplate = transformResumeToCV(debouncedResume);

                const result = await updateResume(debouncedResume.id, {
                    title: debouncedResume.title,
                    data: cvTemplate,
                });

                if (result.success) {
                    setSaveStatus('saved');
                    // Successfully saved - silent success
                } else {
                    setSaveStatus('unsaved');
                    toast.error('Failed to save resume');
                }
            } catch {
                setSaveStatus('unsaved');
                // Auto-save error - silent failure
            } finally {
                setIsSaving(false);
            }
        };

        saveResume();
    }, [debouncedResume]);

    const handleAddSection = async (sectionType: string) => {
        try {
            // Create empty section data based on type
            let sectionData: any = {};
            let sectionTitle = '';

            switch (sectionType) {
                case 'profile':
                    sectionData = {
                        name: '',
                        professionalTitle: '',
                        email: '',
                        phone: '',
                        location: '',
                        summary: '',
                    };
                    sectionTitle = 'Profile';
                    break;
                case 'summary':
                    sectionData = {
                        content: '',
                    };
                    sectionTitle = 'Professional Summary';
                    break;
                case 'links':
                    sectionData = {
                        website: '',
                        linkedin: '',
                        github: '',
                        portfolio: '',
                    };
                    sectionTitle = 'Links';
                    break;
                case 'experience':
                    sectionData = {
                        entries: [],
                    };
                    sectionTitle = 'Work Experience';
                    break;
                case 'education':
                    sectionData = {
                        entries: [],
                    };
                    sectionTitle = 'Education';
                    break;
                case 'skills':
                    sectionData = {
                        categories: [],
                    };
                    sectionTitle = 'Skills';
                    break;
                case 'languages':
                    sectionData = {
                        entries: [],
                    };
                    sectionTitle = 'Languages';
                    break;
                case 'certifications':
                    sectionData = {
                        entries: [],
                    };
                    sectionTitle = 'Certifications';
                    break;
                case 'courses':
                    sectionData = {
                        entries: [],
                    };
                    sectionTitle = 'Courses';
                    break;
                case 'projects':
                    sectionData = {
                        entries: [],
                    };
                    sectionTitle = 'Projects';
                    break;
                case 'awards':
                    sectionData = {
                        entries: [],
                    };
                    sectionTitle = 'Awards & Honors';
                    break;
                case 'publications':
                    sectionData = {
                        entries: [],
                    };
                    sectionTitle = 'Publications';
                    break;
                case 'volunteer':
                    sectionData = {
                        entries: [],
                    };
                    sectionTitle = 'Volunteer Experience';
                    break;
                case 'references':
                    sectionData = {
                        entries: [],
                    };
                    sectionTitle = 'References';
                    break;
                case 'custom':
                    sectionData = {
                        content: '',
                    };
                    sectionTitle = 'Custom Section';
                    break;
                default:
                    throw new Error(`Unknown section type: ${sectionType}`);
            }

            const result = await createResumeSection(clientResume.id, {
                type: sectionType,
                title: sectionTitle,
                content: sectionData,
                order: clientResume.sections.length,
            });

            if (result.success && result.data) {
                // Transform backend section to frontend format and normalize type (backend returns enum values in UPPERCASE)
                const frontendSection = {
                    ...result.data,
                    type: (result.data.type || '').toLowerCase(),
                    data: result.data.content,
                } as ResumeSection;
                delete (frontendSection as any).content;

                // Update local state
                setClientResume(prev => ({
                    ...prev,
                    sections: [...prev.sections, frontendSection],
                    // Normalize the stored section order as lowercase too for consistency
                    sectionOrder: [
                        ...prev.sectionOrder,
                        frontendSection.type as any,
                    ],
                }));
                toast.success(`${sectionTitle} section added successfully`);
            } else {
                toast.error(result.error || 'Failed to add section');
            }
        } catch {
            toast.error('Failed to add section');
        } finally {
            setIsAddContentOpen(false);
        }
    };

    const handleUpdateResume = useCallback((updatedResume: Resume) => {
        setClientResume(updatedResume);
        setSaveStatus('unsaved');
        // TODO: Sync changes to server (debounced already in effect)
    }, []);

    const handleManualSave = useCallback(async () => {
        if (!clientResume.id) return;

        try {
            setIsSaving(true);
            setSaveStatus('saving');
            const cvTemplate = transformResumeToCV(clientResume);

            const result = await updateResume(clientResume.id, {
                title: clientResume.title,
                data: cvTemplate,
            });

            if (result.success) {
                setSaveStatus('saved');
                toast.success('Resume saved successfully');
            } else {
                setSaveStatus('unsaved');
                toast.error('Failed to save resume');
            }
        } catch {
            setSaveStatus('unsaved');
            toast.error('Failed to save resume');
        } finally {
            setIsSaving(false);
        }
    }, [clientResume]);

    const handleDeleteSection = useCallback(async (sectionId: string) => {
        try {
            await deleteResumeSection(sectionId);
            toast.success('Section deleted successfully');

            // Update local state by removing the deleted section
            setClientResume(prev => ({
                ...prev,
                sections: prev.sections.filter(s => s.id !== sectionId),
                sectionOrder: prev.sectionOrder.filter(
                    type =>
                        !prev.sections.find(
                            s => s.id === sectionId && s.type === type,
                        ),
                ),
            }));
        } catch {
            toast.error('Failed to delete section');
        }
    }, []);

    const handleReorderSections = useCallback(
        async (sectionIds: string[]) => {
            try {
                const sectionOrders = sectionIds.map((id, index) => ({
                    id,
                    order: index,
                }));

                const result = await reorderResumeSections(
                    clientResume.id,
                    sectionOrders,
                );

                if (!result.success) {
                    throw new Error(
                        result.error || 'Failed to reorder sections',
                    );
                }
            } catch {
                toast.error('Failed to save section order');
            }
        },
        [clientResume.id],
    );

    return (
        <div className="flex h-screen bg-background">
            {/* Left Panel - Editor */}
            <div className="w-[450px] border-r border-border overflow-hidden flex-shrink-0">
                <EditorPanel
                    resume={clientResume}
                    onUpdateResume={handleUpdateResume}
                    onDeleteSection={handleDeleteSection}
                    onAddContent={() => setIsAddContentOpen(true)}
                    isSaving={isSaving}
                    saveStatus={saveStatus}
                    onManualSave={handleManualSave}
                    onReorderSections={handleReorderSections}
                />
            </div>

            {/* Right Panel - Preview */}
            <div className="flex-1 bg-muted/20">
                <EnhancedPreviewPanel resume={clientResume} />
            </div>

            {/* Add Content Dialog */}
            <AddContentDialog
                open={isAddContentOpen}
                onOpenChange={setIsAddContentOpen}
                onSelectSection={handleAddSection}
                existingSections={clientResume.sections.map(s => s.type)}
            />
        </div>
    );
}
