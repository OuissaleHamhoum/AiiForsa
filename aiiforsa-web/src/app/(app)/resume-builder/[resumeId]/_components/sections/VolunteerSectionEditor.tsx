'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { VolunteerEntry, VolunteerSection } from '@/types/resume.types';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface VolunteerSectionEditorProps {
    section: VolunteerSection;
    onChange: (section: VolunteerSection) => void;
}

export function VolunteerSectionEditor({
    section,
    onChange,
}: VolunteerSectionEditorProps) {
    const handleAdd = () => {
        const entry: VolunteerEntry = {
            id: uuidv4(),
            role: '',
            organization: '',
            location: '',
            startDate: '',
            endDate: '',
            current: false,
            description: '',
        };
        onChange({
            ...section,
            data: { entries: [...section.data.entries, entry] },
        });
    };

    const handleUpdate = (id: string, updates: Partial<VolunteerEntry>) => {
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
                                <Label htmlFor={`volunteer-role-${entry.id}`}>
                                    Role/Position
                                </Label>
                                <Input
                                    id={`volunteer-role-${entry.id}`}
                                    value={entry.role}
                                    onChange={e =>
                                        handleUpdate(entry.id, {
                                            role: e.target.value,
                                        })
                                    }
                                    placeholder="Volunteer role"
                                />
                            </div>
                            <div>
                                <Label
                                    htmlFor={`volunteer-organization-${entry.id}`}
                                >
                                    Organization
                                </Label>
                                <Input
                                    id={`volunteer-organization-${entry.id}`}
                                    value={entry.organization}
                                    onChange={e =>
                                        handleUpdate(entry.id, {
                                            organization: e.target.value,
                                        })
                                    }
                                    placeholder="Organization name"
                                />
                            </div>
                            <div>
                                <Label
                                    htmlFor={`volunteer-location-${entry.id}`}
                                >
                                    Location
                                </Label>
                                <Input
                                    id={`volunteer-location-${entry.id}`}
                                    value={entry.location}
                                    onChange={e =>
                                        handleUpdate(entry.id, {
                                            location: e.target.value,
                                        })
                                    }
                                    placeholder="City, Country"
                                />
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <Label htmlFor={`volunteer-start-${entry.id}`}>
                                    Start Date
                                </Label>
                                <Input
                                    id={`volunteer-start-${entry.id}`}
                                    type="date"
                                    value={entry.startDate}
                                    onChange={e =>
                                        handleUpdate(entry.id, {
                                            startDate: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <Label htmlFor={`volunteer-end-${entry.id}`}>
                                    End Date
                                </Label>
                                <Input
                                    id={`volunteer-end-${entry.id}`}
                                    type="date"
                                    value={entry.endDate || ''}
                                    onChange={e =>
                                        handleUpdate(entry.id, {
                                            endDate: e.target.value,
                                        })
                                    }
                                    disabled={entry.current}
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id={`volunteer-current-${entry.id}`}
                                    checked={entry.current}
                                    onCheckedChange={checked =>
                                        handleUpdate(entry.id, {
                                            current: checked as boolean,
                                            endDate: checked
                                                ? ''
                                                : entry.endDate,
                                        })
                                    }
                                />
                                <Label
                                    htmlFor={`volunteer-current-${entry.id}`}
                                    className="text-sm"
                                >
                                    Currently volunteering
                                </Label>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Label
                                htmlFor={`volunteer-description-${entry.id}`}
                            >
                                Description
                            </Label>
                            <Textarea
                                id={`volunteer-description-${entry.id}`}
                                value={entry.description}
                                onChange={e =>
                                    handleUpdate(entry.id, {
                                        description: e.target.value,
                                    })
                                }
                                placeholder="Describe your volunteer work and contributions"
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
                Add Volunteer Experience
            </Button>
        </div>
    );
}
