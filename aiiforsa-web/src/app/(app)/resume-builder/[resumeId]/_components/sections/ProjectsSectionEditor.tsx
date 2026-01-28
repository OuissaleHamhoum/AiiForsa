'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ProjectEntry, ProjectsSection } from '@/types/resume.types';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface ProjectsSectionEditorProps {
    section: ProjectsSection;
    onChange: (section: ProjectsSection) => void;
}

export function ProjectsSectionEditor({
    section,
    onChange,
}: ProjectsSectionEditorProps) {
    const handleAdd = () => {
        const e: ProjectEntry = {
            id: uuidv4(),
            name: '',
            description: '',
            technologies: [],
            startDate: '',
            endDate: null,
            current: false,
            highlights: [],
            role: '',
        };
        onChange({
            ...section,
            data: { entries: [...section.data.entries, e] },
        });
    };

    const handleUpdate = (id: string, updates: Partial<ProjectEntry>) => {
        onChange({
            ...section,
            data: {
                entries: section.data.entries.map(en =>
                    en.id === id ? { ...en, ...updates } : en,
                ),
            },
        });
    };

    const handleDelete = (id: string) =>
        onChange({
            ...section,
            data: { entries: section.data.entries.filter(en => en.id !== id) },
        });

    return (
        <div className="space-y-4">
            {section.data.entries.map((entry, idx) => (
                <Card key={entry.id} className="border-border bg-card/50">
                    <CardContent className="p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <h4 className="font-semibold">
                                {entry.name || `Project ${idx + 1}`}
                            </h4>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(entry.id)}
                                className="text-red-400"
                            >
                                <Trash2 />
                            </Button>
                        </div>

                        <div className="space-y-3">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div>
                                    <Label>Name</Label>
                                    <Input
                                        value={entry.name}
                                        onChange={e =>
                                            handleUpdate(entry.id, {
                                                name: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label>Role</Label>
                                    <Input
                                        value={entry.role || ''}
                                        onChange={e =>
                                            handleUpdate(entry.id, {
                                                role: e.target.value,
                                            })
                                        }
                                        placeholder="Lead Developer, Team Member"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>URL / Repo</Label>
                                <Input
                                    value={entry.url || ''}
                                    onChange={e =>
                                        handleUpdate(entry.id, {
                                            url: e.target.value,
                                        }) as any
                                    }
                                />
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Textarea
                                    value={entry.description}
                                    onChange={e =>
                                        handleUpdate(entry.id, {
                                            description: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}

            <Button onClick={handleAdd} variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Project
            </Button>
        </div>
    );
}
