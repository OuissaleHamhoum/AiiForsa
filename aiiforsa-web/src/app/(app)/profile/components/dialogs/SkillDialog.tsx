'use client';

import {
    UserSkill,
    createResource,
    deleteResource,
    updateResource,
} from '@/actions/user-actions';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Loader2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface SkillDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    skill?: UserSkill | null;
    onSuccess: () => void;
}

const skillLevels = [
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
    { value: 'EXPERT', label: 'Expert' },
];

const skillCategories = [
    'Programming',
    'Frontend Development',
    'Backend Development',
    'DevOps & Cloud',
    'Database',
    'Design',
    'Management',
    'Communication',
    'Other',
];

export function SkillDialog({
    open,
    onOpenChange,
    skill,
    onSuccess,
}: SkillDialogProps) {
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        level: 'INTERMEDIATE' as
            | 'BEGINNER'
            | 'INTERMEDIATE'
            | 'ADVANCED'
            | 'EXPERT',
        category: '',
        yearsExperience: '',
    });

    useEffect(() => {
        if (skill) {
            setFormData({
                name: skill.name || '',
                level: skill.level || 'INTERMEDIATE',
                category: skill.category || '',
                yearsExperience: skill.yearsExperience?.toString() || '',
            });
        } else {
            setFormData({
                name: '',
                level: 'INTERMEDIATE',
                category: '',
                yearsExperience: '',
            });
        }
    }, [skill, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Map frontend fields to backend DTO format
            const payload: Record<string, any> = {
                name: formData.name,
                level: formData.level,
            };

            // yearsExperience should be an integer
            if (formData.yearsExperience) {
                const years = parseInt(formData.yearsExperience);
                if (!isNaN(years)) {
                    payload.yearsExperience = years;
                }
            }

            // Note: Backend doesn't support 'category' field directly
            // You may want to add it as 'notes' or extend the backend DTO
            if (formData.category) {
                payload.notes = `Category: ${formData.category}`;
            }

            let result;
            if (skill?.id) {
                result = await updateResource('skills', skill.id, payload);
            } else {
                result = await createResource('skills', payload);
            }

            if (result.success) {
                toast.success(
                    skill
                        ? 'Skill updated successfully'
                        : 'Skill added successfully',
                );
                onSuccess();
                onOpenChange(false);
            } else {
                toast.error(result.error || 'Failed to save skill');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!skill?.id) return;

        setDeleting(true);
        try {
            const result = await deleteResource('skills', skill.id);
            if (result.success) {
                toast.success('Skill deleted successfully');
                onSuccess();
                onOpenChange(false);
            } else {
                toast.error(result.error || 'Failed to delete skill');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] bg-[#0a0a0a] border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-white">
                        {skill ? 'Edit Skill' : 'Add Skill'}
                    </DialogTitle>
                    <DialogDescription className="text-white/60">
                        {skill
                            ? 'Update your skill details.'
                            : 'Add a new skill to your profile.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-white/80">
                                Skill Name *
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={e =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                                placeholder="e.g. React, Python, Project Management"
                                required
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="level"
                                    className="text-white/80"
                                >
                                    Proficiency Level *
                                </Label>
                                <Select
                                    value={formData.level}
                                    onValueChange={(
                                        value:
                                            | 'BEGINNER'
                                            | 'INTERMEDIATE'
                                            | 'ADVANCED'
                                            | 'EXPERT',
                                    ) =>
                                        setFormData({
                                            ...formData,
                                            level: value,
                                        })
                                    }
                                >
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#0a0a0a] border-white/10">
                                        {skillLevels.map(level => (
                                            <SelectItem
                                                key={level.value}
                                                value={level.value}
                                                className="text-white hover:bg-white/10"
                                            >
                                                {level.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="yearsExperience"
                                    className="text-white/80"
                                >
                                    Years of Experience
                                </Label>
                                <Input
                                    id="yearsExperience"
                                    type="number"
                                    min="0"
                                    max="50"
                                    value={formData.yearsExperience}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            yearsExperience: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. 5"
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category" className="text-white/80">
                                Category
                            </Label>
                            <Select
                                value={formData.category}
                                onValueChange={value =>
                                    setFormData({
                                        ...formData,
                                        category: value,
                                    })
                                }
                            >
                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0a0a0a] border-white/10">
                                    {skillCategories.map(category => (
                                        <SelectItem
                                            key={category}
                                            value={category}
                                            className="text-white hover:bg-white/10"
                                        >
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter className="flex justify-between">
                        {skill && (
                            <Button
                                type="button"
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={deleting || loading}
                                className="mr-auto"
                            >
                                {deleting ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <Trash2 className="w-4 h-4 mr-2" />
                                )}
                                Delete
                            </Button>
                        )}
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                className="border-white/10 text-white hover:bg-white/10"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-gradient-to-r from-[#cf6318] to-[#e67320]"
                            >
                                {loading && (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                )}
                                {skill ? 'Update' : 'Add'}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
