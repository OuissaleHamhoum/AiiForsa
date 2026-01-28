'use client';

/**
 * Links Section Editor
 * Form for editing profile links and social media
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { LinksSection } from '@/types/resume.types';

interface LinksSectionEditorProps {
    section: LinksSection;
    onChange: (section: LinksSection) => void;
}

export function LinksSectionEditor({
    section,
    onChange,
}: LinksSectionEditorProps) {
    const handleChange = (field: keyof LinksSection['data'], value: string) => {
        onChange({
            ...section,
            data: {
                ...section.data,
                [field]: value,
            },
        });
    };

    return (
        <div className="space-y-4">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
                Links & Social Media
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="website" className="text-foreground">
                        Website
                    </Label>
                    <Input
                        id="website"
                        type="url"
                        value={section.data.website || ''}
                        onChange={e => handleChange('website', e.target.value)}
                        placeholder="https://yourwebsite.com"
                        className="border-border bg-card text-foreground"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="linkedin" className="text-foreground">
                        LinkedIn
                    </Label>
                    <Input
                        id="linkedin"
                        type="url"
                        value={section.data.linkedin || ''}
                        onChange={e => handleChange('linkedin', e.target.value)}
                        placeholder="https://linkedin.com/in/johndoe"
                        className="border-border bg-card text-foreground"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="github" className="text-foreground">
                        GitHub
                    </Label>
                    <Input
                        id="github"
                        type="url"
                        value={section.data.github || ''}
                        onChange={e => handleChange('github', e.target.value)}
                        placeholder="https://github.com/johndoe"
                        className="border-border bg-card text-foreground"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="portfolio" className="text-foreground">
                        Portfolio
                    </Label>
                    <Input
                        id="portfolio"
                        type="url"
                        value={section.data.portfolio || ''}
                        onChange={e =>
                            handleChange('portfolio', e.target.value)
                        }
                        placeholder="https://portfolio.com"
                        className="border-border bg-card text-foreground"
                    />
                </div>
            </div>
        </div>
    );
}
