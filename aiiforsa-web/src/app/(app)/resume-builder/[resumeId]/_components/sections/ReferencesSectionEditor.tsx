'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ReferenceEntry, ReferencesSection } from '@/types/resume.types';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface ReferencesSectionEditorProps {
    section: ReferencesSection;
    onChange: (section: ReferencesSection) => void;
}

export function ReferencesSectionEditor({
    section,
    onChange,
}: ReferencesSectionEditorProps) {
    const handleAdd = () => {
        const entry: ReferenceEntry = {
            id: uuidv4(),
            name: '',
            position: '',
            company: '',
            email: '',
            phone: '',
            relationship: '',
        };
        onChange({
            ...section,
            data: { entries: [...section.data.entries, entry] },
        });
    };

    const handleUpdate = (id: string, updates: Partial<ReferenceEntry>) => {
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
                                <Label htmlFor={`reference-name-${entry.id}`}>
                                    Full Name
                                </Label>
                                <Input
                                    id={`reference-name-${entry.id}`}
                                    value={entry.name}
                                    onChange={e =>
                                        handleUpdate(entry.id, {
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="Reference's full name"
                                />
                            </div>
                            <div>
                                <Label
                                    htmlFor={`reference-position-${entry.id}`}
                                >
                                    Position/Title
                                </Label>
                                <Input
                                    id={`reference-position-${entry.id}`}
                                    value={entry.position}
                                    onChange={e =>
                                        handleUpdate(entry.id, {
                                            position: e.target.value,
                                        })
                                    }
                                    placeholder="Job title"
                                />
                            </div>
                            <div>
                                <Label
                                    htmlFor={`reference-company-${entry.id}`}
                                >
                                    Company
                                </Label>
                                <Input
                                    id={`reference-company-${entry.id}`}
                                    value={entry.company}
                                    onChange={e =>
                                        handleUpdate(entry.id, {
                                            company: e.target.value,
                                        })
                                    }
                                    placeholder="Company name"
                                />
                            </div>
                            <div>
                                <Label
                                    htmlFor={`reference-relationship-${entry.id}`}
                                >
                                    Relationship (Optional)
                                </Label>
                                <Input
                                    id={`reference-relationship-${entry.id}`}
                                    value={entry.relationship || ''}
                                    onChange={e =>
                                        handleUpdate(entry.id, {
                                            relationship: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., Former Manager, Colleague"
                                />
                            </div>
                            <div>
                                <Label htmlFor={`reference-email-${entry.id}`}>
                                    Email
                                </Label>
                                <Input
                                    id={`reference-email-${entry.id}`}
                                    type="email"
                                    value={entry.email}
                                    onChange={e =>
                                        handleUpdate(entry.id, {
                                            email: e.target.value,
                                        })
                                    }
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div>
                                <Label htmlFor={`reference-phone-${entry.id}`}>
                                    Phone
                                </Label>
                                <Input
                                    id={`reference-phone-${entry.id}`}
                                    type="tel"
                                    value={entry.phone}
                                    onChange={e =>
                                        handleUpdate(entry.id, {
                                            phone: e.target.value,
                                        })
                                    }
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>
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
                Add Reference
            </Button>
        </div>
    );
}
