import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CustomSection } from '@/types/resume.types';

interface CustomSectionEditorProps {
    section: CustomSection;
    onChange: (section: CustomSection) => void;
}

export function CustomSectionEditor({
    section,
    onChange,
}: CustomSectionEditorProps) {
    const handleTitleChange = (value: string) => {
        onChange({
            ...section,
            title: value,
        });
    };

    const handleContentChange = (value: string) => {
        onChange({
            ...section,
            data: {
                content: value,
            },
        });
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="custom-title" className="text-foreground">
                    Section Title
                </Label>
                <Input
                    id="custom-title"
                    value={section.title || ''}
                    onChange={event => handleTitleChange(event.target.value)}
                    placeholder="e.g. Conference Talks, Leadership Experience"
                    className="border-border bg-card text-foreground"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="custom-content" className="text-foreground">
                    Content
                </Label>
                <Textarea
                    id="custom-content"
                    value={section.data.content || ''}
                    onChange={event => handleContentChange(event.target.value)}
                    placeholder="Add bullet points or short paragraphs to describe this section."
                    className="min-h-[160px] border-border bg-card text-foreground"
                />
            </div>
        </div>
    );
}
