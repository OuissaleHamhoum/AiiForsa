/**
 * Resume Template Wrapper
 * Common wrapper component for all resume templates
 * Handles shared logic like page breaks and A4 formatting
 */

import type { Resume } from '@/types/resume.types';
import { cn } from '@/lib/utils';

interface TemplateWrapperProps {
    resume: Resume;
    children: React.ReactNode;
    className?: string;
}

export function TemplateWrapper({
    resume,
    children,
    className,
}: TemplateWrapperProps) {
    return (
        <div
            id="resume-template"
            className={cn(
                'a4-page resume-text',
                'w-[210mm] min-h-[297mm]',
                'bg-white text-gray-900',
                'p-10',
                className,
            )}
            data-resume-id={resume.id}
        >
            {children}
        </div>
    );
}
