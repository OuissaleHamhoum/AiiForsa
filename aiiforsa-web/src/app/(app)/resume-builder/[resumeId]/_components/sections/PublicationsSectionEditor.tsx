'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type {
    PublicationEntry,
    PublicationsSection,
} from '@/types/resume.types';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface PublicationsSectionEditorProps {
    section: PublicationsSection;
    onChange: (section: PublicationsSection) => void;
}

export function PublicationsSectionEditor({
    section,
    onChange,
}: PublicationsSectionEditorProps) {
    const handleAdd = () => {
        const entry: PublicationEntry = {
            id: uuidv4(),
            title: '',
            publisher: '',
            date: '',
            url: '',
            description: '',
        };
        onChange({
            ...section,
            data: { entries: [...section.data.entries, entry] },
        });
    };

    const handleUpdate = (id: string, updates: Partial<PublicationEntry>) => {
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
                                <Label
                                    htmlFor={`publication-title-${entry.id}`}
                                >
                                    Title
                                </Label>
                                <Input
                                    id={`publication-title-${entry.id}`}
                                    value={entry.title}
                                    onChange={e =>
                                        handleUpdate(entry.id, {
                                            title: e.target.value,
                                        })
                                    }
                                    placeholder="Publication title"
                                />
                            </div>
                            <div>
                                <Label
                                    htmlFor={`publication-publisher-${entry.id}`}
                                >
                                    Publisher/Journal
                                </Label>
                                <Input
                                    id={`publication-publisher-${entry.id}`}
                                    value={entry.publisher}
                                    onChange={e =>
                                        handleUpdate(entry.id, {
                                            publisher: e.target.value,
                                        })
                                    }
                                    placeholder="Publisher or journal name"
                                />
                            </div>
                            <div>
                                <Label htmlFor={`publication-date-${entry.id}`}>
                                    Publication Date
                                </Label>
                                <Input
                                    id={`publication-date-${entry.id}`}
                                    type="date"
                                    value={entry.date}
                                    onChange={e =>
                                        handleUpdate(entry.id, {
                                            date: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <Label htmlFor={`publication-url-${entry.id}`}>
                                    URL (Optional)
                                </Label>
                                <Input
                                    id={`publication-url-${entry.id}`}
                                    type="url"
                                    value={entry.url}
                                    onChange={e =>
                                        handleUpdate(entry.id, {
                                            url: e.target.value,
                                        })
                                    }
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <Label
                                htmlFor={`publication-description-${entry.id}`}
                            >
                                Description (Optional)
                            </Label>
                            <Textarea
                                id={`publication-description-${entry.id}`}
                                value={entry.description}
                                onChange={e =>
                                    handleUpdate(entry.id, {
                                        description: e.target.value,
                                    })
                                }
                                placeholder="Brief description or abstract"
                                rows={3}
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
                Add Publication
            </Button>
        </div>
    );
}
