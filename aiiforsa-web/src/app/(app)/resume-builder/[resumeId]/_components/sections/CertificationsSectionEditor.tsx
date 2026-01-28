'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type {
    CertificationEntry,
    CertificationsSection,
} from '@/types/resume.types';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface CertificationsSectionEditorProps {
    section: CertificationsSection;
    onChange: (section: CertificationsSection) => void;
}

export function CertificationsSectionEditor({
    section,
    onChange,
}: CertificationsSectionEditorProps) {
    const handleAdd = () => {
        const e: CertificationEntry = {
            id: uuidv4(),
            name: '',
            issuer: '',
            date: '',
            achievements: [],
        } as any;
        onChange({
            ...section,
            data: { entries: [...section.data.entries, e] },
        });
    };

    const handleUpdate = (id: string, updates: Partial<CertificationEntry>) => {
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
                                {entry.name || `Certification ${idx + 1}`}
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
                                <Label>Issuer</Label>
                                <Input
                                    value={entry.issuer}
                                    onChange={e =>
                                        handleUpdate(entry.id, {
                                            issuer: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <Label>Date</Label>
                                <Input
                                    type="month"
                                    value={entry.date}
                                    onChange={e =>
                                        handleUpdate(entry.id, {
                                            date: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}

            <Button onClick={handleAdd} variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Certification
            </Button>
        </div>
    );
}
