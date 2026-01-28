'use client';

/**
 * Enhanced Preview Panel Component
 * Right panel showing live preview of the resume with template styling
 */

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Resume } from '@/types/resume.types';
import { Download, Palette, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';
import { TemplateSelector } from './TemplateSelector';
import type { ResumeTemplateId } from '@/types/resume-templates.types';
import { ModernTemplate } from './templates/ModernTemplate';
import { usePdfExport } from '@/hooks/use-pdf-export';
import { ClassicTemplate } from './templates/ClassicTemplate';
import { MinimalTemplate } from './templates/MinimalTemplate';

interface PreviewPanelProps {
    resume: Resume;
}

export function EnhancedPreviewPanel({ resume }: PreviewPanelProps) {
    const [zoom, setZoom] = useState(100);
    const [selectedTemplate, setSelectedTemplate] =
        useState<ResumeTemplateId>('modern');
    const [showTemplateSelector, setShowTemplateSelector] = useState(false);
    const { exportToPdf, isExporting } = usePdfExport({
        filename: `${resume.title || 'resume'}.pdf`,
    });

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 150));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));

    const renderTemplate = () => {
        const templateProps = { resume };

        switch (selectedTemplate) {
            case 'classic':
                return <ClassicTemplate {...templateProps} />;
            case 'minimal':
                return <MinimalTemplate {...templateProps} />;
            case 'modern':
            default:
                return <ModernTemplate {...templateProps} />;
        }
    };

    return (
        <div className="flex h-full flex-col">
            {/* Preview Controls Header */}
            <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
                <div className="flex items-center gap-2">
                    <h2 className="font-semibold">Preview</h2>
                    <span className="text-xs text-muted-foreground">
                        {selectedTemplate.charAt(0).toUpperCase() +
                            selectedTemplate.slice(1)}{' '}
                        Template
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Zoom Controls */}
                    <div className="flex items-center gap-1 rounded-md border border-border">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleZoomOut}
                            disabled={zoom <= 50}
                            className="h-8 px-2"
                        >
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="min-w-[50px] text-center text-sm">
                            {zoom}%
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleZoomIn}
                            disabled={zoom >= 150}
                            className="h-8 px-2"
                        >
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Template Selector */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowTemplateSelector(true)}
                        className="gap-2"
                    >
                        <Palette className="h-4 w-4" />
                        Change Template
                    </Button>

                    {/* Download PDF */}
                    <Button
                        size="sm"
                        className="gap-2"
                        onClick={() => exportToPdf('resume-preview')}
                        disabled={isExporting || resume.sections.length === 0}
                    >
                        <Download className="h-4 w-4" />
                        {isExporting ? 'Exporting...' : 'Download PDF'}
                    </Button>
                </div>
            </div>

            {/* Preview Content */}
            <ScrollArea className="flex-1">
                <div className="flex min-h-full items-start justify-center bg-muted/30 p-6">
                    <div
                        className="origin-top shadow-2xl transition-transform"
                        style={{
                            transform: `scale(${zoom / 100})`,
                            width: '210mm',
                            minHeight: '297mm',
                        }}
                    >
                        {/* Resume Template Content */}
                        <div
                            id="resume-preview"
                            className="bg-white w-[210mm] min-h-[297mm]"
                        >
                            {resume.sections.length === 0 ? (
                                <div className="flex items-center justify-center p-12 min-h-[297mm]">
                                    <div className="text-center">
                                        <p className="mb-2 text-lg font-semibold text-gray-600">
                                            Your resume preview will appear here
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            Start adding content to see the
                                            preview
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                renderTemplate()
                            )}
                        </div>
                    </div>
                </div>
            </ScrollArea>

            {/* Template Selector Modal */}
            <TemplateSelector
                open={showTemplateSelector}
                onOpenChange={setShowTemplateSelector}
                currentTemplate={selectedTemplate}
                onSelectTemplate={setSelectedTemplate}
            />
        </div>
    );
}
