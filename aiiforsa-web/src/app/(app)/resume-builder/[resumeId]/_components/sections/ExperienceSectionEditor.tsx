'use client';

/**
 * Experience Section Editor
 * Form for managing work experience entries
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { ExperienceEntry, ExperienceSection } from '@/types/resume.types';
import { Plus, Trash2, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface ExperienceSectionEditorProps {
    section: ExperienceSection;
    onChange: (section: ExperienceSection) => void;
}

export function ExperienceSectionEditor({
    section,
    onChange,
}: ExperienceSectionEditorProps) {
    const handleAddEntry = () => {
        const newEntry: ExperienceEntry = {
            id: uuidv4(),
            jobTitle: '',
            company: '',
            location: '',
            startDate: '',
            endDate: null,
            current: false,
            description: '',
            achievements: [],
            tags: [],
        };

        onChange({
            ...section,
            data: {
                entries: [...section.data.entries, newEntry],
            },
        });
    };

    const handleUpdateEntry = (
        id: string,
        updates: Partial<ExperienceEntry>,
    ) => {
        onChange({
            ...section,
            data: {
                entries: section.data.entries.map(entry =>
                    entry.id === id ? { ...entry, ...updates } : entry,
                ),
            },
        });
    };

    const handleDeleteEntry = (id: string) => {
        onChange({
            ...section,
            data: {
                entries: section.data.entries.filter(entry => entry.id !== id),
            },
        });
    };

    const handleAddAchievement = (entryId: string) => {
        const entry = section.data.entries.find(e => e.id === entryId);
        if (entry) {
            handleUpdateEntry(entryId, {
                achievements: [...entry.achievements, ''],
            });
        }
    };

    const handleUpdateAchievement = (
        entryId: string,
        index: number,
        value: string,
    ) => {
        const entry = section.data.entries.find(e => e.id === entryId);
        if (entry) {
            const newAchievements = [...entry.achievements];
            newAchievements[index] = value;
            handleUpdateEntry(entryId, {
                achievements: newAchievements,
            });
        }
    };

    const handleDeleteAchievement = (entryId: string, index: number) => {
        const entry = section.data.entries.find(e => e.id === entryId);
        if (entry) {
            handleUpdateEntry(entryId, {
                achievements: entry.achievements.filter((_, i) => i !== index),
            });
        }
    };

    return (
        <div className="space-y-4">
            {section.data.entries.map((entry, index) => (
                <Card
                    key={entry.id}
                    className="border-border bg-card/50 backdrop-blur-sm"
                >
                    <CardContent className="p-4">
                        <div className="mb-4 flex items-center justify-between">
                            <h4 className="font-semibold text-foreground">
                                {entry.jobTitle || `Experience ${index + 1}`}
                            </h4>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteEntry(entry.id)}
                                className="text-red-400 hover:bg-red-400/10 hover:text-red-300"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label className="text-foreground">
                                        Job Title *
                                    </Label>
                                    <Input
                                        value={entry.jobTitle}
                                        onChange={e =>
                                            handleUpdateEntry(entry.id, {
                                                jobTitle: e.target.value,
                                            })
                                        }
                                        placeholder="Software Engineer"
                                        className="border-border bg-card text-foreground placeholder:text-muted-foreground"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-foreground">
                                        Company *
                                    </Label>
                                    <Input
                                        value={entry.company}
                                        onChange={e =>
                                            handleUpdateEntry(entry.id, {
                                                company: e.target.value,
                                            })
                                        }
                                        placeholder="Tech Corp"
                                        className="border-border bg-card text-foreground placeholder:text-muted-foreground"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-foreground">
                                        Location *
                                    </Label>
                                    <Input
                                        value={entry.location}
                                        onChange={e =>
                                            handleUpdateEntry(entry.id, {
                                                location: e.target.value,
                                            })
                                        }
                                        placeholder="San Francisco, CA"
                                        className="border-border bg-card text-foreground placeholder:text-muted-foreground"
                                    />
                                </div>

                                <div className="space-y-2 sm:col-span-2">
                                    <Label className="text-foreground">
                                        Tags
                                    </Label>
                                    <Input
                                        value={entry.tags?.join(', ') || ''}
                                        onChange={e =>
                                            handleUpdateEntry(entry.id, {
                                                tags: e.target.value
                                                    .split(',')
                                                    .map(t => t.trim())
                                                    .filter(Boolean),
                                            })
                                        }
                                        placeholder="JavaScript, React, Node.js"
                                        className="border-border bg-card text-foreground placeholder:text-muted-foreground"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Comma-separated skills/technologies used
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-foreground">
                                        Start Date *
                                    </Label>
                                    <Input
                                        type="month"
                                        value={entry.startDate}
                                        onChange={e =>
                                            handleUpdateEntry(entry.id, {
                                                startDate: e.target.value,
                                            })
                                        }
                                        className="border-border bg-card text-foreground placeholder:text-muted-foreground"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-foreground">
                                        End Date
                                    </Label>
                                    <Input
                                        type="month"
                                        value={entry.endDate || ''}
                                        onChange={e =>
                                            handleUpdateEntry(entry.id, {
                                                endDate: e.target.value,
                                                current: !e.target.value,
                                            })
                                        }
                                        disabled={entry.current}
                                        className="border-border bg-card text-foreground placeholder:text-muted-foreground disabled:opacity-50"
                                    />
                                    <label className="flex items-center gap-2 text-sm text-foreground">
                                        <input
                                            type="checkbox"
                                            checked={entry.current}
                                            onChange={e =>
                                                handleUpdateEntry(entry.id, {
                                                    current: e.target.checked,
                                                    endDate: e.target.checked
                                                        ? null
                                                        : entry.endDate,
                                                })
                                            }
                                            className="rounded border-border"
                                        />
                                        Currently working here
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-foreground">
                                    Description
                                </Label>
                                <Textarea
                                    value={entry.description}
                                    onChange={e =>
                                        handleUpdateEntry(entry.id, {
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="Brief overview of your role and responsibilities..."
                                    rows={3}
                                    className="border-border bg-card text-foreground placeholder:text-muted-foreground"
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-foreground">
                                        Key Achievements
                                    </Label>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            handleAddAchievement(entry.id)
                                        }
                                        className="text-foreground hover:bg-accent"
                                    >
                                        <Plus className="mr-1 h-3 w-3" />
                                        Add
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {entry.achievements.map(
                                        (achievement, achIdx) => (
                                            <div
                                                key={achIdx}
                                                className="flex gap-2"
                                            >
                                                <Input
                                                    value={achievement}
                                                    onChange={e =>
                                                        handleUpdateAchievement(
                                                            entry.id,
                                                            achIdx,
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Describe a specific achievement or impact..."
                                                    className="flex-1 border-border bg-card text-foreground placeholder:text-muted-foreground"
                                                />
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDeleteAchievement(
                                                            entry.id,
                                                            achIdx,
                                                        )
                                                    }
                                                    className="text-red-400 hover:bg-red-400/10 hover:text-red-300"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ),
                                    )}
                                    {entry.achievements.length === 0 && (
                                        <p className="text-xs text-muted-foreground">
                                            No achievements added. Click
                                            &quot;Add&quot; to include your key
                                            accomplishments.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}

            <Button
                onClick={handleAddEntry}
                variant="outline"
                className="w-full border-border bg-card text-foreground hover:bg-accent"
            >
                <Plus className="mr-2 h-4 w-4" />
                Add Experience
            </Button>
        </div>
    );
}
