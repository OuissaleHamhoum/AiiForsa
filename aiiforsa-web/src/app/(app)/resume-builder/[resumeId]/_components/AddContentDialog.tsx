'use client';

/**
 * Add Content Dialog Component
 * Modal for selecting resume sections to add
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { ResumeSectionType, SectionConfig } from '@/types/resume.types';
import {
    Award,
    BookMarked,
    BookOpen,
    Briefcase,
    Code,
    FileText,
    FolderGit2,
    GraduationCap,
    Heart,
    Languages,
    Plus,
    Trophy,
    User,
    Users,
} from 'lucide-react';

interface AddContentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectSection: (sectionType: ResumeSectionType) => void;
    existingSections: ResumeSectionType[];
}

const SECTION_CONFIGS: SectionConfig[] = [
    {
        type: 'profile',
        title: 'Profile',
        description: 'Your name, contact info, and links',
        icon: 'User',
        isRequired: true,
    },
    {
        type: 'links',
        title: 'Links',
        description: 'Social media and portfolio links',
        icon: 'Users',
        isMultiple: true,
    },
    {
        type: 'experience',
        title: 'Work Experience',
        description: 'Your employment history and achievements',
        icon: 'Briefcase',
        isMultiple: true,
    },
    {
        type: 'education',
        title: 'Education',
        description: 'Your academic background',
        icon: 'GraduationCap',
        isMultiple: true,
    },
    {
        type: 'skills',
        title: 'Skills',
        description: 'Technical and soft skills',
        icon: 'Code',
    },
    {
        type: 'certifications',
        title: 'Certifications',
        description: 'Professional certifications',
        icon: 'Award',
        isMultiple: true,
    },
    {
        type: 'courses',
        title: 'Courses',
        description: 'Relevant courses and training',
        icon: 'BookOpen',
        isMultiple: true,
    },
    {
        type: 'projects',
        title: 'Projects',
        description: 'Notable projects and contributions',
        icon: 'FolderGit2',
        isMultiple: true,
    },
    {
        type: 'languages',
        title: 'Languages',
        description: 'Languages you speak',
        icon: 'Languages',
        isMultiple: true,
    },
    {
        type: 'awards',
        title: 'Awards & Honors',
        description: 'Recognition and achievements',
        icon: 'Trophy',
        isMultiple: true,
    },
    {
        type: 'publications',
        title: 'Publications',
        description: 'Articles, papers, and books',
        icon: 'BookMarked',
        isMultiple: true,
    },
    {
        type: 'volunteer',
        title: 'Volunteer Experience',
        description: 'Community involvement',
        icon: 'Heart',
        isMultiple: true,
    },
    {
        type: 'references',
        title: 'References',
        description: 'Professional references',
        icon: 'Users',
        isMultiple: true,
    },
    {
        type: 'custom',
        title: 'Custom Section',
        description: 'Add your own section',
        icon: 'Plus',
    },
];

const iconMap: Record<string, any> = {
    User,
    FileText,
    Briefcase,
    GraduationCap,
    Code,
    Award,
    BookOpen,
    FolderGit2,
    Languages,
    Trophy,
    BookMarked,
    Heart,
    Users,
    Plus,
};

export function AddContentDialog({
    open,
    onOpenChange,
    onSelectSection,
    existingSections,
}: AddContentDialogProps) {
    const handleSelectSection = (sectionType: ResumeSectionType) => {
        onSelectSection(sectionType);
        onOpenChange(false);
    };

    const isSectionAdded = (sectionType: ResumeSectionType): boolean => {
        // Custom sections can be added multiple times
        if (sectionType === 'custom') return false;
        return existingSections.includes(sectionType);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        Add Content to Your Resume
                    </DialogTitle>
                    <DialogDescription>
                        Select the sections you want to include in your resume
                    </DialogDescription>
                </DialogHeader>

                <div className="grid max-h-[60vh] gap-4 overflow-y-auto py-4 sm:grid-cols-2 lg:grid-cols-3">
                    {SECTION_CONFIGS.map(config => {
                        const Icon = iconMap[config.icon];
                        const isAdded = isSectionAdded(config.type);

                        return (
                            <Card
                                key={config.type}
                                className={`group cursor-pointer transition-all hover:shadow-md ${
                                    isAdded
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:border-primary'
                                }`}
                                onClick={() =>
                                    !isAdded && handleSelectSection(config.type)
                                }
                            >
                                <CardContent className="flex flex-col p-4">
                                    <div className="mb-3 flex items-start justify-between gap-2">
                                        <div className="rounded-lg bg-primary/10 p-2">
                                            <Icon className="h-5 w-5 text-primary" />
                                        </div>
                                        {isAdded && (
                                            <Badge variant="secondary">
                                                Added
                                            </Badge>
                                        )}
                                        {config.isRequired && !isAdded && (
                                            <Badge variant="default">
                                                Required
                                            </Badge>
                                        )}
                                    </div>
                                    <h3 className="mb-2 font-semibold">
                                        {config.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        {config.description}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>
    );
}
