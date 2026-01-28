'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { LanguageEntry, LanguagesSection } from '@/types/resume.types';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface LanguagesSectionEditorProps {
    section: LanguagesSection;
    onChange: (section: LanguagesSection) => void;
}

export function LanguagesSectionEditor({
    section,
    onChange,
}: LanguagesSectionEditorProps) {
    const handleAdd = () => {
        const e: LanguageEntry = {
            id: uuidv4(),
            language: '',
            proficiency: 'beginner',
        };
        onChange({
            ...section,
            data: { entries: [...section.data.entries, e] },
        });
    };

    const handleUpdate = (id: string, updates: Partial<LanguageEntry>) => {
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
                                {entry.language || `Language ${idx + 1}`}
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

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label>Language</Label>
                                <Input
                                    value={entry.language}
                                    onChange={e =>
                                        handleUpdate(entry.id, {
                                            language: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <Label>Proficiency</Label>
                                <Input
                                    value={entry.proficiency}
                                    onChange={e =>
                                        handleUpdate(entry.id, {
                                            proficiency: e.target.value as any,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}

            <Button onClick={handleAdd} variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Language
            </Button>
        </div>
    );
}
