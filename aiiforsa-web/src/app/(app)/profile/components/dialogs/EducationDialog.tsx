'use client';

import {
    UserEducation,
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

interface EducationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    education?: UserEducation | null;
    onSuccess: () => void;
}

export function EducationDialog({
    open,
    onOpenChange,
    education,
    onSuccess,
}: EducationDialogProps) {
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [formData, setFormData] = useState({
        degree: '',
        fieldOfStudy: '',
        institution: '',
        location: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        gpa: '',
        description: '',
    });

    useEffect(() => {
        if (education) {
            setFormData({
                degree: education.degree || '',
                fieldOfStudy: education.fieldOfStudy || '',
                institution: education.institution || '',
                location: education.location || '',
                startDate: education.startDate
                    ? education.startDate.split('T')[0]
                    : '',
                endDate: education.endDate
                    ? education.endDate.split('T')[0]
                    : '',
                isCurrent: education.isCurrent || false,
                gpa: education.gpa || '',
                description: education.description || '',
            });
        } else {
            setFormData({
                degree: '',
                fieldOfStudy: '',
                institution: '',
                location: '',
                startDate: '',
                endDate: '',
                isCurrent: false,
                gpa: '',
                description: '',
            });
        }
    }, [education, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Map frontend fields to backend DTO format
            const payload: Record<string, any> = {
                degree: formData.degree,
                institution: formData.institution,
                fieldOfStudy: formData.fieldOfStudy || undefined,
                location: formData.location || undefined,
                description: formData.description || undefined,
            };

            // Handle dates
            if (formData.startDate) {
                payload.startDate = new Date(formData.startDate).toISOString();
            }

            // Backend uses 'status' enum instead of 'isCurrent'
            if (formData.isCurrent) {
                payload.status = 'IN_PROGRESS';
            } else {
                payload.status = 'COMPLETED';
                if (formData.endDate) {
                    payload.endDate = new Date(formData.endDate).toISOString();
                }
            }

            // GPA should be a number
            if (formData.gpa) {
                const gpaValue = parseFloat(formData.gpa);
                if (!isNaN(gpaValue)) {
                    payload.gpa = gpaValue;
                }
            }

            let result;
            if (education?.id) {
                result = await updateResource(
                    'educations',
                    education.id,
                    payload,
                );
            } else {
                result = await createResource('educations', payload);
            }

            if (result.success) {
                toast.success(
                    education
                        ? 'Education updated successfully'
                        : 'Education added successfully',
                );
                onSuccess();
                onOpenChange(false);
            } else {
                toast.error(result.error || 'Failed to save education');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!education?.id) return;

        setDeleting(true);
        try {
            const result = await deleteResource('educations', education.id);
            if (result.success) {
                toast.success('Education deleted successfully');
                onSuccess();
                onOpenChange(false);
            } else {
                toast.error(result.error || 'Failed to delete education');
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
                        {education ? 'Edit Education' : 'Add Education'}
                    </DialogTitle>
                    <DialogDescription className="text-white/60">
                        {education
                            ? 'Update your education details.'
                            : 'Add a new education entry to your profile.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="degree"
                                    className="text-white/80"
                                >
                                    Degree *
                                </Label>
                                <Input
                                    id="degree"
                                    value={formData.degree}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            degree: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. Bachelor's Degree"
                                    required
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="fieldOfStudy"
                                    className="text-white/80"
                                >
                                    Field of Study
                                </Label>
                                <Input
                                    id="fieldOfStudy"
                                    value={formData.fieldOfStudy}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            fieldOfStudy: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. Computer Science"
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label
                                htmlFor="institution"
                                className="text-white/80"
                            >
                                Institution *
                            </Label>
                            <Input
                                id="institution"
                                value={formData.institution}
                                onChange={e =>
                                    setFormData({
                                        ...formData,
                                        institution: e.target.value,
                                    })
                                }
                                placeholder="e.g. Stanford University"
                                required
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="location"
                                    className="text-white/80"
                                >
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
                                    placeholder="e.g. Stanford, CA"
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gpa" className="text-white/80">
                                    GPA
                                </Label>
                                <Input
                                    id="gpa"
                                    value={formData.gpa}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            gpa: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. 3.8/4.0"
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
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
                                I am currently studying here
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
                                placeholder="Relevant coursework, achievements, activities..."
                                rows={3}
                                className="bg-white/5 border-white/10 text-white resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex justify-between">
                        {education && (
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
                                {education ? 'Update' : 'Add'}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
