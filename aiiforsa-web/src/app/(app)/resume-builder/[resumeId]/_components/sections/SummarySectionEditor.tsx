import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { SummarySection } from '@/types/resume.types';

interface SummarySectionEditorProps {
    section: SummarySection;
    onChange: (section: SummarySection) => void;
}

export function SummarySectionEditor({
    section,
    onChange,
}: SummarySectionEditorProps) {
    const handleChange = (value: string) => {
        onChange({
            ...section,
            data: {
                content: value,
            },
        });
    };

    return (
        <div className="space-y-3">
            <div className="space-y-2">
                <Label htmlFor="summary-content" className="text-foreground">
                    Professional Summary
                </Label>
                <Textarea
                    id="summary-content"
                    value={section.data.content || ''}
                    onChange={event => handleChange(event.target.value)}
                    placeholder="Highlight your years of experience, core strengths, and what sets you apart."
                    className="min-h-[160px] border-border bg-card text-foreground"
                />
                <p className="text-xs text-muted-foreground">
                    Keep it concise (33 sentences) and focused on measurable
                    achievements.
                </p>
            </div>
        </div>
    );
}
