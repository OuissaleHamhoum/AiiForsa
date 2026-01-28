'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { EducationEntry, EducationSection } from '@/types/resume.types';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface EducationSectionEditorProps {
    section: EducationSection;
    onChange: (section: EducationSection) => void;
}

export function EducationSectionEditor({
    section,
    onChange,
}: EducationSectionEditorProps) {
    const handleAdd = () => {
        const newEntry: EducationEntry = {
            id: uuidv4(),
            degree: '',
            institution: '',
            location: '',
            startDate: '',
            endDate: null,
            current: false,
            achievements: [],
            description: '',
        };
        onChange({
            ...section,
            data: { entries: [...section.data.entries, newEntry] },
        });
    };

    const handleUpdate = (id: string, updates: Partial<EducationEntry>) => {
        onChange({
            ...section,
            data: {
                entries: section.data.entries.map(e =>
                    e.id === id ? { ...e, ...updates } : e,
                ),
            },
        });
    };

    const handleDelete = (id: string) => {
        onChange({
            ...section,
            data: { entries: section.data.entries.filter(e => e.id !== id) },
        });
    };

    return (
        <div className="space-y-4">
            {section.data.entries.map((entry, idx) => (
                <Card key={entry.id} className="border-border bg-card/50">
                    <CardContent className="p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <h4 className="font-semibold">
                                {entry.degree || `Education ${idx + 1}`}
                            </h4>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(entry.id)}
                                className="text-red-400"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label>Degree</Label>
                                <Input
                                    value={entry.degree}
                                    onChange={e =>
                                        handleUpdate(entry.id, {
                                            degree: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., Bachelor of Science"
                                />
                            </div>
                            <div>
                                <Label>Major/Field of Study</Label>
                                <Input
                                    value={entry.major || ''}
                                    onChange={e =>
                                        handleUpdate(entry.id, {
                                            major: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., Computer Science"
                                />
                            </div>
                            <div>
                                <Label>Institution</Label>
                                <Input
                                    value={entry.institution}
                                    onChange={e =>
                                        handleUpdate(entry.id, {
                                            institution: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., University Name"
                                />
                            </div>
                            <div>
                                <Label>Location</Label>
                                <Input
                                    value={entry.location}
                                    onChange={e =>
                                        handleUpdate(entry.id, {
                                            location: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <Label>Dates</Label>
                                <div className="flex gap-2">
                                    <Input
                                        type="month"
                                        value={entry.startDate}
                                        onChange={e =>
                                            handleUpdate(entry.id, {
                                                startDate: e.target.value,
                                            })
                                        }
                                    />
                                    <Input
                                        type="month"
                                        value={entry.endDate || ''}
                                        onChange={e =>
                                            handleUpdate(entry.id, {
                                                endDate: e.target.value || null,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-3">
                            <Label>Description</Label>
                            <Textarea
                                value={entry.description || ''}
                                onChange={e =>
                                    handleUpdate(entry.id, {
                                        description: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </CardContent>
                </Card>
            ))}

            <Button onClick={handleAdd} variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Education
            </Button>
        </div>
    );
}
