'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Check, Pencil, X } from 'lucide-react';
import { useState } from 'react';

export interface EditableFieldProps {
    label: string;
    value?: string;
    onSave: (value: string) => Promise<void> | void;
    type?: 'text' | 'email' | 'tel' | 'date' | 'textarea';
    required?: boolean;
    validate?: (value: string) => string | null;
    placeholder?: string;
}

export function EditableField({
    label,
    value = '',
    onSave,
    type = 'text',
    required = false,
    validate,
    placeholder,
}: EditableFieldProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (required && !editValue.trim()) {
            setError('This field is required');
            return;
        }

        if (validate) {
            const validationError = validate(editValue);
            if (validationError) {
                setError(validationError);
                return;
            }
        }

        setIsSaving(true);
        try {
            await onSave(editValue);
            setIsEditing(false);
            setError(null);
        } catch {
            setError('Failed to save. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditValue(value);
        setError(null);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="space-y-2">
                <Label htmlFor={`edit-${label}`}>{label}</Label>
                {type === 'textarea' ? (
                    <Textarea
                        id={`edit-${label}`}
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        placeholder={placeholder}
                        rows={4}
                    />
                ) : (
                    <Input
                        id={`edit-${label}`}
                        type={type}
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        placeholder={placeholder}
                    />
                )}
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-[#e67320] hover:bg-[#cf6318]"
                    >
                        <Check className="mr-1 h-4 w-4" />
                        Save
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSaving}
                    >
                        <X className="mr-1 h-4 w-4" />
                        Cancel
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="group space-y-2">
            <Label>{label}</Label>
            <div className="flex items-center justify-between gap-2 rounded-md border border-input bg-background p-3 transition-colors hover:border-muted-foreground/30">
                <span className="text-sm">
                    {value || (
                        <span className="text-muted-foreground">Not set</span>
                    )}
                </span>
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditing(true)}
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                >
                    <Pencil className="h-3 w-3" />
                </Button>
            </div>
        </div>
    );
}
