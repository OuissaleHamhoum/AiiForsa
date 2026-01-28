'use client';

/**
 * Template Selector Component
 * Allows users to choose resume template styles
 */

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Check, Crown } from 'lucide-react';
import {
    RESUME_TEMPLATES,
    type ResumeTemplateId,
} from '@/types/resume-templates.types';

interface TemplateSelectorProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentTemplate: ResumeTemplateId;
    onSelectTemplate: (templateId: ResumeTemplateId) => void;
}

export function TemplateSelector({
    open,
    onOpenChange,
    currentTemplate,
    onSelectTemplate,
}: TemplateSelectorProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        Choose Resume Template
                    </DialogTitle>
                    <DialogDescription>
                        Select a template style that best represents your
                        professional brand
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] pr-4">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {RESUME_TEMPLATES.map(template => (
                            <div
                                key={template.id}
                                className={`group relative cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
                                    currentTemplate === template.id
                                        ? 'border-primary shadow-lg'
                                        : 'border-border hover:border-primary/50'
                                }`}
                                onClick={() => onSelectTemplate(template.id)}
                            >
                                {/* Template Preview */}
                                <div className="aspect-[210/297] bg-muted relative">
                                    {/* Placeholder for template preview */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="text-center p-4">
                                            <div className="text-4xl font-bold mb-2">
                                                {template.name}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {template.description}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Selected indicator */}
                                    {currentTemplate === template.id && (
                                        <div className="absolute top-2 right-2 rounded-full bg-primary p-1">
                                            <Check className="h-4 w-4 text-primary-foreground" />
                                        </div>
                                    )}

                                    {/* Premium badge */}
                                    {template.isPremium && (
                                        <div className="absolute top-2 left-2">
                                            <Badge className="bg-yellow-500/90 text-yellow-950">
                                                <Crown className="mr-1 h-3 w-3" />
                                                Premium
                                            </Badge>
                                        </div>
                                    )}
                                </div>

                                {/* Template Info */}
                                <div className="p-3 border-t">
                                    <h3 className="font-semibold mb-1">
                                        {template.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground line-clamp-2">
                                        {template.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button onClick={() => onOpenChange(false)}>
                        Apply Template
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
