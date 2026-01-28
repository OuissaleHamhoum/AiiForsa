'use client';

import {
    UserCertification,
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

interface CertificationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    certification?: UserCertification | null;
    onSuccess: () => void;
}

export function CertificationDialog({
    open,
    onOpenChange,
    certification,
    onSuccess,
}: CertificationDialogProps) {
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        issuer: '',
        issueDate: '',
        expiryDate: '',
        credentialId: '',
        credentialUrl: '',
        description: '',
    });

    useEffect(() => {
        if (certification) {
            setFormData({
                name: certification.name || '',
                issuer: certification.issuer || '',
                issueDate: certification.issueDate
                    ? certification.issueDate.split('T')[0]
                    : '',
                expiryDate: certification.expiryDate
                    ? certification.expiryDate.split('T')[0]
                    : '',
                credentialId: certification.credentialId || '',
                credentialUrl: certification.credentialUrl || '',
                description: certification.description || '',
            });
        } else {
            setFormData({
                name: '',
                issuer: '',
                issueDate: '',
                expiryDate: '',
                credentialId: '',
                credentialUrl: '',
                description: '',
            });
        }
    }, [certification, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Map frontend field names to backend field names
            const payload: Record<string, any> = {
                name: formData.name,
                issuer: formData.issuer,
                credentialId: formData.credentialId || undefined,
                description: formData.description || undefined,
            };

            // Only include issueDate if it has a value
            if (formData.issueDate) {
                payload.issueDate = new Date(formData.issueDate).toISOString();
            }

            // Backend uses 'expirationDate' not 'expiryDate'
            if (formData.expiryDate) {
                payload.expirationDate = new Date(
                    formData.expiryDate,
                ).toISOString();
            }

            // Only include credentialUrl if it's a valid URL
            if (
                formData.credentialUrl &&
                formData.credentialUrl.startsWith('http')
            ) {
                payload.credentialUrl = formData.credentialUrl;
            }

            let result;
            if (certification?.id) {
                result = await updateResource(
                    'certifications',
                    certification.id,
                    payload,
                );
            } else {
                result = await createResource('certifications', payload);
            }

            if (result.success) {
                toast.success(
                    certification
                        ? 'Certification updated successfully'
                        : 'Certification added successfully',
                );
                onSuccess();
                onOpenChange(false);
            } else {
                toast.error(result.error || 'Failed to save certification');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!certification?.id) return;

        setDeleting(true);
        try {
            const result = await deleteResource(
                'certifications',
                certification.id,
            );
            if (result.success) {
                toast.success('Certification deleted successfully');
                onSuccess();
                onOpenChange(false);
            } else {
                toast.error(result.error || 'Failed to delete certification');
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
                        {certification
                            ? 'Edit Certification'
                            : 'Add Certification'}
                    </DialogTitle>
                    <DialogDescription className="text-white/60">
                        {certification
                            ? 'Update your certification details.'
                            : 'Add a new certification to your profile.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-white/80">
                                    Certification Name *
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
                                    placeholder="e.g. AWS Certified Developer"
                                    required
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
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
                                    placeholder="e.g. Amazon Web Services"
                                    required
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="issueDate"
                                    className="text-white/80"
                                >
                                    Issue Date *
                                </Label>
                                <Input
                                    id="issueDate"
                                    type="date"
                                    value={formData.issueDate}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            issueDate: e.target.value,
                                        })
                                    }
                                    required
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="expiryDate"
                                    className="text-white/80"
                                >
                                    Expiry Date
                                </Label>
                                <Input
                                    id="expiryDate"
                                    type="date"
                                    value={formData.expiryDate}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            expiryDate: e.target.value,
                                        })
                                    }
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="credentialId"
                                    className="text-white/80"
                                >
                                    Credential ID
                                </Label>
                                <Input
                                    id="credentialId"
                                    value={formData.credentialId}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            credentialId: e.target.value,
                                        })
                                    }
                                    placeholder="e.g. ABC123XYZ"
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="credentialUrl"
                                    className="text-white/80"
                                >
                                    Credential URL
                                </Label>
                                <Input
                                    id="credentialUrl"
                                    type="url"
                                    value={formData.credentialUrl}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            credentialUrl: e.target.value,
                                        })
                                    }
                                    placeholder="https://..."
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
                                placeholder="Brief description of the certification..."
                                rows={3}
                                className="bg-white/5 border-white/10 text-white resize-none"
                            />
                        </div>
                    </div>
                    <DialogFooter className="flex justify-between">
                        {certification && (
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
                                {certification ? 'Update' : 'Add'}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
