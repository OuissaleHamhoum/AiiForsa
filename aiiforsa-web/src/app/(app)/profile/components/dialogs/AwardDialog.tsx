'use client';

import {
    UserAward,
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
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface AwardDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    award?: UserAward | null;
    onSuccess: () => void;
}

export function AwardDialog({
    open,
    onOpenChange,
    award,
    onSuccess,
}: AwardDialogProps) {
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        issuer: '',
        date: '',
        description: '',
    });

    useEffect(() => {
        if (award) {
            setFormData({
                title: award.title || '',
                issuer: award.issuer || '',
                date: award.date ? award.date.split('T')[0] : '',
                description: award.description || '',
            });
        } else {
            setFormData({
                title: '',
                issuer: '',
                date: '',
                description: '',
            });
        }
    }, [award, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                date: formData.date
                    ? new Date(formData.date).toISOString()
                    : undefined,
            };

            let result;
            if (award?.id) {
                result = await updateResource('awards', award.id, payload);
            } else {
                result = await createResource('awards', payload);
            }

            if (result.success) {
                toast.success(
                    award
                        ? 'Award updated successfully'
                        : 'Award added successfully',
                );
                onSuccess();
                onOpenChange(false);
            } else {
                toast.error(result.error || 'Failed to save award');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!award?.id) return;

        setDeleting(true);
        try {
            const result = await deleteResource('awards', award.id);
            if (result.success) {
                toast.success('Award deleted successfully');
                onSuccess();
                onOpenChange(false);
            } else {
                toast.error(result.error || 'Failed to delete award');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-[#0a0a0a] border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-white">
                        {award ? 'Edit Award' : 'Add Award'}
                    </DialogTitle>
                    <DialogDescription className="text-white/60">
                        {award
                            ? 'Update your award or honor details.'
                            : 'Add a new award or honor to your profile.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-white/80">
                                Award Title *
                            </Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={e =>
                                    setFormData({
                                        ...formData,
                                        title: e.target.value,
                                    })
                                }
                                placeholder="e.g. Employee of the Year"
                                required
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="issuer"
                                    className="text-white/80"
                                >
                                    Issuing Organization *
                                </Label>
                                <Input
                                    id="issuer"
                                    value={formData.issuer}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            issuer: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. Tech Corp"
                                    required
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date" className="text-white/80">
                                    Date Received *
                                </Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            date: e.target.value,
                                        })
                                    }
                                    required
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
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
                                placeholder="Brief description of the award..."
                                rows={3}
                                className="bg-white/5 border-white/10 text-white resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex justify-between">
                        {award && (
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
                                {award ? 'Update' : 'Add'}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
