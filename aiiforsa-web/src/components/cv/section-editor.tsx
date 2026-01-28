/**
 * Section Editor Component
 * Editable CV section with AI-powered suggestions
 */

'use client';

import { useState } from 'react';
import { type CvSection } from '@/lib/api/cv-api';
import { useSectionActions, useCvAiActions } from '@/hooks/use-cv';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    GripVertical,
    MoreVertical,
    Trash2,
    Sparkles,
    Save,
    X,
} from 'lucide-react';
import { toast } from 'sonner';

const SECTION_TYPES = [
    { value: 'PROFILE', label: 'Profile' },
    { value: 'SUMMARY', label: 'Summary' },
    { value: 'EXPERIENCE', label: 'Experience' },
    { value: 'EDUCATION', label: 'Education' },
    { value: 'SKILLS', label: 'Skills' },
    { value: 'CERTIFICATIONS', label: 'Certifications' },
    { value: 'PROJECTS', label: 'Projects' },
    { value: 'LANGUAGES', label: 'Languages' },
    { value: 'INTERESTS', label: 'Interests' },
    { value: 'REFERENCES', label: 'References' },
    { value: 'CUSTOM', label: 'Custom' },
];

interface SectionEditorProps {
    section: CvSection;
    cvId: string;
    onReorder: (sectionIds: string[]) => void;
}

export function SectionEditor({
    section,
    cvId,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onReorder: _onReorder,
}: SectionEditorProps) {
    const { updateSection, deleteSection } = useSectionActions(cvId);
    const { reviewCv } = useCvAiActions(cvId);

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isReviewing, setIsReviewing] = useState(false);

    const [editedSection, setEditedSection] = useState({
        type: section.type,
        title: section.title,
        content: JSON.stringify(section.content, null, 2),
    });

    const handleSave = async () => {
        setIsSaving(true);
        try {
            let parsedContent;
            try {
                parsedContent = JSON.parse(editedSection.content);
            } catch {
                parsedContent = { text: editedSection.content };
            }

            await updateSection(section.id, {
                type: editedSection.type,
                title: editedSection.title,
                content: parsedContent,
            });

            setIsEditing(false);
            toast.success('Section updated');
        } catch {
            toast.error('Failed to update section');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditedSection({
            type: section.type,
            title: section.title,
            content: JSON.stringify(section.content, null, 2),
        });
        setIsEditing(false);
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this section?')) return;

        try {
            await deleteSection(section.id);
            toast.success('Section deleted');
        } catch {
            toast.error('Failed to delete section');
        }
    };

    const handleReview = async () => {
        setIsReviewing(true);
        try {
            await reviewCv();
            toast.success(
                'Section reviewed. Check suggestions panel for feedback.',
            );
        } catch {
            toast.error('Failed to review section');
        } finally {
            setIsReviewing(false);
        }
    };

    return (
        <Card className="relative group">
            {/* Drag Handle */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                <GripVertical className="w-5 h-5 text-muted-foreground" />
            </div>

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 pl-10">
                {isEditing ? (
                    <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                            <Input
                                value={editedSection.title}
                                onChange={e =>
                                    setEditedSection({
                                        ...editedSection,
                                        title: e.target.value,
                                    })
                                }
                                placeholder="Section title"
                                className="flex-1"
                            />
                            <Select
                                value={editedSection.type}
                                onValueChange={value =>
                                    setEditedSection({
                                        ...editedSection,
                                        type: value as any,
                                    })
                                }
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {SECTION_TYPES.map(type => (
                                        <SelectItem
                                            key={type.value}
                                            value={type.value}
                                        >
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">
                            {section.title}
                        </h3>
                        <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                            {SECTION_TYPES.find(t => t.value === section.type)
                                ?.label || section.type}
                        </span>
                    </div>
                )}

                <div className="flex items-center gap-1">
                    {isEditing ? (
                        <>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleCancel}
                                disabled={isSaving}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                            <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                <Save className="w-4 h-4 mr-1" />
                                {isSaving ? 'Saving...' : 'Save'}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleReview}
                                disabled={isReviewing}
                            >
                                <Sparkles className="w-4 h-4 mr-1" />
                                {isReviewing ? 'Reviewing...' : 'Review'}
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="ghost">
                                        <MoreVertical className="w-4 h-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={() => setIsEditing(true)}
                                    >
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={handleDelete}
                                        className="text-destructive"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    )}
                </div>
            </CardHeader>

            <CardContent>
                {isEditing ? (
                    <Textarea
                        value={editedSection.content}
                        onChange={e =>
                            setEditedSection({
                                ...editedSection,
                                content: e.target.value,
                            })
                        }
                        placeholder="Section content (JSON format)"
                        className="font-mono text-sm min-h-[200px]"
                    />
                ) : (
                    <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto max-h-[400px]">
                        {JSON.stringify(section.content, null, 2)}
                    </pre>
                )}
            </CardContent>
        </Card>
    );
}
