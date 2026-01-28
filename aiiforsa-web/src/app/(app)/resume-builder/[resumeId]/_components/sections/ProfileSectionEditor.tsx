'use client';

/**
 * Profile Section Editor
 * Form for editing profile/contact information
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LocationInput } from '@/components/ui/location-input';
import { PhoneInput } from '@/components/ui/phone-input';
import { Textarea } from '@/components/ui/textarea';
import type { ProfileSection } from '@/types/resume.types';

interface ProfileSectionEditorProps {
    section: ProfileSection;
    onChange: (section: ProfileSection) => void;
}

export function ProfileSectionEditor({
    section,
    onChange,
}: ProfileSectionEditorProps) {
    const handleChange = (
        field: keyof ProfileSection['data'],
        value: string,
    ) => {
        onChange({
            ...section,
            data: {
                ...section.data,
                [field]: value,
            },
        });
    };

    return (
        <div className="space-y-6">
            {/* Full Name - Full Width */}
            <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">
                    Full Name *
                </Label>
                <Input
                    id="name"
                    value={section.data.name}
                    onChange={e => handleChange('name', e.target.value)}
                    placeholder="John Doe"
                    className="border-border bg-card text-foreground"
                />
            </div>

            {/* Professional Title - Full Width */}
            <div className="space-y-2">
                <Label htmlFor="professionalTitle" className="text-foreground">
                    Professional Title
                </Label>
                <Input
                    id="professionalTitle"
                    value={section.data.professionalTitle || ''}
                    onChange={e =>
                        handleChange('professionalTitle', e.target.value)
                    }
                    placeholder="Software Engineer"
                    className="border-border bg-card text-foreground"
                />
            </div>

            {/* Email and Phone - Side by Side */}
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">
                        Email *
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        value={section.data.email}
                        onChange={e => handleChange('email', e.target.value)}
                        placeholder="john@example.com"
                        className="border-border bg-card text-foreground"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone" className="text-foreground">
                        Phone *
                    </Label>
                    <PhoneInput
                        value={section.data.phone}
                        onChange={value => handleChange('phone', value || '')}
                        placeholder="+1 (555) 123-4567"
                    />
                </div>
            </div>

            {/* Location - Full Width */}
            <div className="space-y-2">
                <Label htmlFor="location" className="text-foreground">
                    Location *
                </Label>
                <LocationInput
                    value={section.data.location}
                    onChange={value => handleChange('location', value)}
                />
            </div>

            {/* Professional Summary - Full Width */}
            <div className="space-y-2">
                <Label htmlFor="summary" className="text-foreground">
                    Professional Summary
                </Label>
                <Textarea
                    id="summary"
                    value={section.data.summary || ''}
                    onChange={e => handleChange('summary', e.target.value)}
                    placeholder="Brief overview of your professional background, skills, and career objectives..."
                    className="min-h-[120px] resize-y border-border bg-card text-foreground"
                />
            </div>
        </div>
    );
}
