'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { AwardEntry, AwardsSection } from '@/types/resume.types';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface AwardsSectionEditorProps {
    section: AwardsSection;
    onChange: (section: AwardsSection) => void;
}

export function AwardsSectionEditor({
    section,
    onChange,
}: AwardsSectionEditorProps) {
    const handleAdd = () => {
        const entry: AwardEntry = {
            id: uuidv4(),
            title: '',
            issuer: '',
            date: '',
            description: '',
        };
        onChange({
            ...section,
            data: { entries: [...section.data.entries, entry] },
        });
    };

    const handleUpdate = (id: string, updates: Partial<AwardEntry>) => {
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
                                <Label htmlFor={`award-title-${entry.id}`}>
                                    Award Title
                                </Label>
                                <Input
                                    id={`award-title-${entry.id}`}
                                    value={entry.title}
                                    onChange={e =>
                                        handleUpdate(entry.id, {
                                            title: e.target.value,
                                        })
                                    }
                                    placeholder="Award name"
                                />
                            </div>
                            <div>
                                <Label htmlFor={`award-issuer-${entry.id}`}>
                                    Issuing Organization
                                </Label>
                                <Input
                                    id={`award-issuer-${entry.id}`}
                                    value={entry.issuer}
                                    onChange={e =>
                                        handleUpdate(entry.id, {
                                            issuer: e.target.value,
                                        })
                                    }
                                    placeholder="Organization name"
                                />
                            </div>
                            <div>
                                <Label htmlFor={`award-date-${entry.id}`}>
                                    Date Received
                                </Label>
                                <Input
                                    id={`award-date-${entry.id}`}
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
                            <Label htmlFor={`award-description-${entry.id}`}>
                                Description (Optional)
                            </Label>
                            <Textarea
                                id={`award-description-${entry.id}`}
                                value={entry.description || ''}
                                onChange={e =>
                                    handleUpdate(entry.id, {
                                        description: e.target.value,
                                    })
                                }
                                placeholder="Describe the award or achievement"
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
                Add Award
            </Button>
        </div>
    );
}
