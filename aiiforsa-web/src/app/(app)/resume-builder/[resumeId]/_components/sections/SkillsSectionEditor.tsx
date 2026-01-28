'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { SkillCategory, SkillsSection } from '@/types/resume.types';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface SkillsSectionEditorProps {
    section: SkillsSection;
    onChange: (section: SkillsSection) => void;
}

export function SkillsSectionEditor({
    section,
    onChange,
}: SkillsSectionEditorProps) {
    const handleAddCategory = () => {
        const cat: SkillCategory = {
            id: uuidv4(),
            name: 'New Category',
            skills: [],
        };
        onChange({
            ...section,
            data: { categories: [...section.data.categories, cat] },
        });
    };

    const handleUpdateCategory = (
        id: string,
        updates: Partial<SkillCategory>,
    ) => {
        onChange({
            ...section,
            data: {
                categories: section.data.categories.map(c =>
                    c.id === id ? { ...c, ...updates } : c,
                ),
            },
        });
    };

    const handleDeleteCategory = (id: string) => {
        onChange({
            ...section,
            data: {
                categories: section.data.categories.filter(c => c.id !== id),
            },
        });
    };

    const handleAddSkill = (catId: string) => {
        handleUpdateCategory(catId, {
            skills: [
                ...(section.data.categories.find(c => c.id === catId)?.skills ||
                    []),
                '',
            ],
        });
    };

    const handleUpdateSkill = (catId: string, idx: number, value: string) => {
        const cat = section.data.categories.find(c => c.id === catId);
        if (!cat) return;
        const skills = [...cat.skills];
        skills[idx] = value;
        handleUpdateCategory(catId, { skills });
    };

    const handleDeleteSkill = (catId: string, idx: number) => {
        const cat = section.data.categories.find(c => c.id === catId);
        if (!cat) return;
        const skills = cat.skills.filter((_, i) => i !== idx);
        handleUpdateCategory(catId, { skills });
    };

    return (
        <div className="space-y-4">
            {section.data.categories.map(cat => (
                <Card key={cat.id} className="border-border bg-card/50">
                    <CardContent className="p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <Input
                                value={cat.name}
                                onChange={e =>
                                    handleUpdateCategory(cat.id, {
                                        name: e.target.value,
                                    })
                                }
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="text-red-400"
                            >
                                <Trash2 />
                            </Button>
                        </div>

                        <div className="space-y-2">
                            {cat.skills.map((s, i) => (
                                <div key={i} className="flex gap-2">
                                    <Input
                                        value={s}
                                        onChange={e =>
                                            handleUpdateSkill(
                                                cat.id,
                                                i,
                                                e.target.value,
                                            )
                                        }
                                        className="flex-1"
                                    />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            handleDeleteSkill(cat.id, i)
                                        }
                                        className="text-red-400"
                                    >
                                        <Trash2 />
                                    </Button>
                                </div>
                            ))}
                            <div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleAddSkill(cat.id)}
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Add Skill
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}

            <Button
                onClick={handleAddCategory}
                variant="outline"
                className="w-full"
            >
                <Plus className="mr-2 h-4 w-4" /> Add Skill Category
            </Button>
        </div>
    );
}
