'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CourseEntry, CoursesSection } from '@/types/resume.types';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface CoursesSectionEditorProps {
    section: CoursesSection;
    onChange: (section: CoursesSection) => void;
}

export function CoursesSectionEditor({
    section,
    onChange,
}: CoursesSectionEditorProps) {
    const handleAdd = () => {
        const entry: CourseEntry = {
            id: uuidv4(),
            name: '',
            institution: '',
            date: '',
            description: '',
        };
        onChange({
            ...section,
            data: { entries: [...section.data.entries, entry] },
        });
    };

    const handleUpdate = (id: string, updates: Partial<CourseEntry>) => {
        onChange({
            ...section,
            data: {
                entries: section.data.entries.map(entry =>
                    entry.id === id ? { ...entry, ...updates } : entry,
                ),
            },
        });
    };

    const handleDelete = (id: string) =>
        onChange({
            ...section,
            data: {
                entries: section.data.entries.filter(entry => entry.id !== id),
            },
        });

    return (
        <div className="space-y-4">
            {section.data.entries.map(entry => (
                <Card key={entry.id}>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label htmlFor={`course-name-${entry.id}`}>
                                    Course Name
                                </Label>
                                <Input
                                    id={`course-name-${entry.id}`}
                                    value={entry.name}
                                    onChange={e =>
                                        handleUpdate(entry.id, {
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="Course name"
                                />
                            </div>
                            <div>
                                <Label
                                    htmlFor={`course-institution-${entry.id}`}
                                >
                                    Institution
                                </Label>
                                <Input
                                    id={`course-institution-${entry.id}`}
                                    value={entry.institution}
                                    onChange={e =>
                                        handleUpdate(entry.id, {
                                            institution: e.target.value,
                                        })
                                    }
                                    placeholder="Institution name"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor={`course-date-${entry.id}`}>
                                    Completion Date
                                </Label>
                                <Input
                                    id={`course-date-${entry.id}`}
                                    type="date"
                                    value={entry.date}
                                    onChange={e =>
                                        handleUpdate(entry.id, {
                                            date: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <Label htmlFor={`course-description-${entry.id}`}>
                                Description (Optional)
                            </Label>
                            <Textarea
                                id={`course-description-${entry.id}`}
                                value={entry.description}
                                onChange={e =>
                                    handleUpdate(entry.id, {
                                        description: e.target.value,
                                    })
                                }
                                placeholder="Brief description of the course"
                                rows={2}
                            />
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(entry.id)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
            <Button onClick={handleAdd} className="w-full" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Course
            </Button>
        </div>
    );
}
