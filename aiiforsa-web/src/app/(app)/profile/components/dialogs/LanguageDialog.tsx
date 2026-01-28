'use client';

import {
    UserLanguage,
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

interface LanguageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    language?: UserLanguage | null;
    onSuccess: () => void;
}

// Map frontend proficiency to backend enum values
const proficiencyLevels = [
    { value: 'ELEMENTARY', label: 'Basic' },
    { value: 'LIMITED_WORKING', label: 'Limited Working' },
    { value: 'PROFESSIONAL_WORKING', label: 'Professional Working' },
    { value: 'FULL_PROFESSIONAL', label: 'Full Professional' },
    { value: 'NATIVE', label: 'Native' },
];

export function LanguageDialog({
    open,
    onOpenChange,
    language,
    onSuccess,
}: LanguageDialogProps) {
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [formData, setFormData] = useState({
        language: '',
        proficiency: 'PROFESSIONAL_WORKING' as
            | 'ELEMENTARY'
            | 'LIMITED_WORKING'
            | 'PROFESSIONAL_WORKING'
            | 'FULL_PROFESSIONAL'
            | 'NATIVE',
    });

    useEffect(() => {
        if (language) {
            setFormData({
                language: language.language || '',
                proficiency: language.proficiency || 'PROFESSIONAL_WORKING',
            });
        } else {
            setFormData({
                language: '',
                proficiency: 'PROFESSIONAL_WORKING',
            });
        }
    }, [language, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Map frontend field names to backend field names
            const payload = {
                name: formData.language, // Backend uses 'name' not 'language'
                proficiency: formData.proficiency,
            };

            let result;
            if (language?.id) {
                result = await updateResource(
                    'languages',
                    language.id,
                    payload,
                );
            } else {
                result = await createResource('languages', payload);
            }

            if (result.success) {
                toast.success(
                    language
                        ? 'Language updated successfully'
                        : 'Language added successfully',
                );
                onSuccess();
                onOpenChange(false);
            } else {
                toast.error(result.error || 'Failed to save language');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!language?.id) return;

        setDeleting(true);
        try {
            const result = await deleteResource('languages', language.id);
            if (result.success) {
                toast.success('Language deleted successfully');
                onSuccess();
                onOpenChange(false);
            } else {
                toast.error(result.error || 'Failed to delete language');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] bg-[#0a0a0a] border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-white">
                        {language ? 'Edit Language' : 'Add Language'}
                    </DialogTitle>
                    <DialogDescription className="text-white/60">
                        {language
                            ? 'Update your language proficiency.'
                            : 'Add a language to your profile.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="language" className="text-white/80">
                                Language *
                            </Label>
                            <Input
                                id="language"
                                value={formData.language}
                                onChange={e =>
                                    setFormData({
                                        ...formData,
                                        language: e.target.value,
                                    })
                                }
                                placeholder="e.g. English, Spanish, French"
                                required
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label
                                htmlFor="proficiency"
                                className="text-white/80"
                            >
                                Proficiency Level *
                            </Label>
                            <Select
                                value={formData.proficiency}
                                onValueChange={(
                                    value:
                                        | 'ELEMENTARY'
                                        | 'LIMITED_WORKING'
                                        | 'PROFESSIONAL_WORKING'
                                        | 'FULL_PROFESSIONAL'
                                        | 'NATIVE',
                                ) =>
                                    setFormData({
                                        ...formData,
                                        proficiency: value,
                                    })
                                }
                            >
                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                    <SelectValue placeholder="Select proficiency" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0a0a0a] border-white/10">
                                    {proficiencyLevels.map(level => (
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
                    </div>
                    <DialogFooter className="flex justify-between">
                        {language && (
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
                                {language ? 'Update' : 'Add'}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
