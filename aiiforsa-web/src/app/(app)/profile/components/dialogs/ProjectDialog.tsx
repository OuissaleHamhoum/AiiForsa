'use client';

import {
    UserProject,
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

interface ProjectDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    project?: UserProject | null;
    onSuccess: () => void;
}

export function ProjectDialog({
    open,
    onOpenChange,
    project,
    onSuccess,
}: ProjectDialogProps) {
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        role: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        url: '',
        technologies: '',
        highlights: '',
    });

    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name || '',
                description: project.description || '',
                role: project.role || '',
                startDate: project.startDate
                    ? project.startDate.split('T')[0]
                    : '',
                endDate: project.endDate ? project.endDate.split('T')[0] : '',
                isCurrent: project.isCurrent || false,
                url: project.url || '',
                technologies: project.technologies || '',
                highlights: project.highlights || '',
            });
        } else {
            setFormData({
                name: '',
                description: '',
                role: '',
                startDate: '',
                endDate: '',
                isCurrent: false,
                url: '',
                technologies: '',
                highlights: '',
            });
        }
    }, [project, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Map frontend field names to backend field names
            const payload: Record<string, any> = {
                name: formData.name,
                description: formData.description || undefined,
                role: formData.role || undefined,
                highlights: formData.highlights || undefined,
            };

            // Handle dates
            if (formData.startDate) {
                payload.startDate = new Date(formData.startDate).toISOString();
            }
            if (!formData.isCurrent && formData.endDate) {
                payload.endDate = new Date(formData.endDate).toISOString();
            }

            // Backend expects 'liveUrl' not 'url', and only if valid URL
            if (formData.url && formData.url.startsWith('http')) {
                payload.liveUrl = formData.url;
            }

            // Backend expects technologies as array
            if (formData.technologies) {
                payload.technologies = formData.technologies
                    .split(',')
                    .map(t => t.trim())
                    .filter(Boolean);
            }

            let result;
            if (project?.id) {
                result = await updateResource('projects', project.id, payload);
            } else {
                result = await createResource('projects', payload);
            }

            if (result.success) {
                toast.success(
                    project
                        ? 'Project updated successfully'
                        : 'Project added successfully',
                );
                onSuccess();
                onOpenChange(false);
            } else {
                toast.error(result.error || 'Failed to save project');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!project?.id) return;

        setDeleting(true);
        try {
            const result = await deleteResource('projects', project.id);
            if (result.success) {
                toast.success('Project deleted successfully');
                onSuccess();
                onOpenChange(false);
            } else {
                toast.error(result.error || 'Failed to delete project');
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
                        {project ? 'Edit Project' : 'Add Project'}
                    </DialogTitle>
                    <DialogDescription className="text-white/60">
                        {project
                            ? 'Update your project details.'
                            : 'Add a new project to showcase your work.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-white/80">
                                    Project Name *
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
                                    placeholder="e.g. AI Job Matcher"
                                    required
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role" className="text-white/80">
                                    Your Role
                                </Label>
                                <Input
                                    id="role"
                                    value={formData.role}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            role: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. Lead Developer"
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="url" className="text-white/80">
                                Project URL
                            </Label>
                            <Input
                                id="url"
                                type="url"
                                value={formData.url}
                                onChange={e =>
                                    setFormData({
                                        ...formData,
                                        url: e.target.value,
                                    })
                                }
                                placeholder="https://github.com/..."
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label
                                htmlFor="technologies"
                                className="text-white/80"
                            >
                                Technologies
                            </Label>
                            <Input
                                id="technologies"
                                value={formData.technologies}
                                onChange={e =>
                                    setFormData({
                                        ...formData,
                                        technologies: e.target.value,
                                    })
                                }
                                placeholder="React, Node.js, PostgreSQL (comma-separated)"
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="startDate"
                                    className="text-white/80"
                                >
                                    Start Date
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
                                This project is ongoing
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
                                placeholder="Describe what the project does..."
                                rows={3}
                                className="bg-white/5 border-white/10 text-white resize-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label
                                htmlFor="highlights"
                                className="text-white/80"
                            >
                                Key Highlights
                            </Label>
                            <Textarea
                                id="highlights"
                                value={formData.highlights}
                                onChange={e =>
                                    setFormData({
                                        ...formData,
                                        highlights: e.target.value,
                                    })
                                }
                                placeholder="Key achievements or features..."
                                rows={2}
                                className="bg-white/5 border-white/10 text-white resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex justify-between">
                        {project && (
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
                                {project ? 'Update' : 'Add'}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
