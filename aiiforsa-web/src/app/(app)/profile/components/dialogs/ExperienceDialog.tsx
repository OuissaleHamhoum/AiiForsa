'use client';

import {
    UserWorkExperience,
    createResource,
    deleteResource,
    updateResource,
} from '@/actions/user-actions';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ExperienceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    experience?: UserWorkExperience | null;
    onSuccess: () => void;
}

export function ExperienceDialog({
    open,
    onOpenChange,
    experience,
    onSuccess,
}: ExperienceDialogProps) {
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [formData, setFormData] = useState({
        jobTitle: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: '',
    });

    useEffect(() => {
        if (experience) {
            setFormData({
                jobTitle: experience.jobTitle || '',
                company: experience.company || '',
                location: experience.location || '',
                startDate: experience.startDate
                    ? experience.startDate.split('T')[0]
                    : '',
                endDate: experience.endDate
                    ? experience.endDate.split('T')[0]
                    : '',
                isCurrent: experience.isCurrent || false,
                description: experience.description || '',
            });
        } else {
            setFormData({
                jobTitle: '',
                company: '',
                location: '',
                startDate: '',
                endDate: '',
                isCurrent: false,
                description: '',
            });
        }
    }, [experience, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Map frontend fields to backend DTO format
            const payload: Record<string, any> = {
                position: formData.jobTitle, // Backend uses 'position' not 'jobTitle'
                company: formData.company,
                location: formData.location || undefined,
                description: formData.description || undefined,
                isCurrentPosition: formData.isCurrent, // Backend uses 'isCurrentPosition'
            };

            // Handle dates
            if (formData.startDate) {
                payload.startDate = new Date(formData.startDate).toISOString();
            }
            if (!formData.isCurrent && formData.endDate) {
                payload.endDate = new Date(formData.endDate).toISOString();
            }

            let result;
            if (experience?.id) {
                result = await updateResource(
                    'work-experiences',
                    experience.id,
                    payload,
                );
            } else {
                result = await createResource('work-experiences', payload);
            }

            if (result.success) {
                toast.success(
                    experience
                        ? 'Experience updated successfully'
                        : 'Experience added successfully',
                );
                onSuccess();
                onOpenChange(false);
            } else {
                toast.error(result.error || 'Failed to save experience');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!experience?.id) return;

        setDeleting(true);
        try {
            const result = await deleteResource(
                'work-experiences',
                experience.id,
            );
            if (result.success) {
                toast.success('Experience deleted successfully');
                onSuccess();
                onOpenChange(false);
            } else {
                toast.error(result.error || 'Failed to delete experience');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] bg-[#0a0a0a] border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-white">
                        {experience ? 'Edit Experience' : 'Add Experience'}
                    </DialogTitle>
                    <DialogDescription className="text-white/60">
                        {experience
                            ? 'Update your work experience details.'
                            : 'Add a new work experience to your profile.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="jobTitle"
                                    className="text-white/80"
                                >
                                    Job Title *
                                </Label>
                                <Input
                                    id="jobTitle"
                                    value={formData.jobTitle}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            jobTitle: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. Senior Developer"
                                    required
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="company"
                                    className="text-white/80"
                                >
                                    Company *
                                </Label>
                                <Input
                                    id="company"
                                    value={formData.company}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            company: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. Tech Corp"
                                    required
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location" className="text-white/80">
                                Location
                            </Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={e =>
                                    setFormData({
                                        ...formData,
                                        location: e.target.value,
                                    })
                                }
                                placeholder="e.g. San Francisco, CA"
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="startDate"
                                    className="text-white/80"
                                >
                                    Start Date *
                                </Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            startDate: e.target.value,
                                        })
                                    }
                                    required
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="endDate"
                                    className="text-white/80"
                                >
                                    End Date
                                </Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            endDate: e.target.value,
                                        })
                                    }
                                    disabled={formData.isCurrent}
                                    className="bg-white/5 border-white/10 text-white disabled:opacity-50"
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isCurrent"
                                checked={formData.isCurrent}
                                onCheckedChange={checked =>
                                    setFormData({
                                        ...formData,
                                        isCurrent: checked as boolean,
                                    })
                                }
                            />
                            <Label
                                htmlFor="isCurrent"
                                className="text-white/80 cursor-pointer"
                            >
                                I currently work here
                            </Label>
                        </div>
                        <div className="space-y-2">
                            <Label
                                htmlFor="description"
                                className="text-white/80"
                            >
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={e =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
                                    })
                                }
                                placeholder="Describe your role and achievements..."
                                rows={4}
                                className="bg-white/5 border-white/10 text-white resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex justify-between">
                        {experience && (
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
                                {experience ? 'Update' : 'Add'}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
