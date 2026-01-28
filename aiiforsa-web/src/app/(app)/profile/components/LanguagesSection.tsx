'use client';

import { UserLanguage } from '@/actions/user-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit, Languages, Plus } from 'lucide-react';
import { useState } from 'react';
import { LanguageDialog } from './dialogs';

interface LanguagesSectionProps {
    languages?: UserLanguage[];
    onRefresh: () => void;
}

// Map backend proficiency enum to display properties
const proficiencyColors: Record<string, string> = {
    NATIVE: 'from-purple-500 to-pink-500',
    FULL_PROFESSIONAL: 'from-blue-500 to-cyan-500',
    PROFESSIONAL_WORKING: 'from-green-500 to-emerald-500',
    LIMITED_WORKING: 'from-yellow-500 to-orange-500',
    ELEMENTARY: 'from-gray-500 to-slate-500',
    // Fallback for old values
    FLUENT: 'from-blue-500 to-cyan-500',
    PROFESSIONAL: 'from-green-500 to-emerald-500',
    CONVERSATIONAL: 'from-yellow-500 to-orange-500',
    BASIC: 'from-gray-500 to-slate-500',
};

const proficiencyLabels: Record<string, string> = {
    NATIVE: 'Native',
    FULL_PROFESSIONAL: 'Full Professional',
    PROFESSIONAL_WORKING: 'Professional Working',
    LIMITED_WORKING: 'Limited Working',
    ELEMENTARY: 'Elementary',
    // Fallback for old values
    FLUENT: 'Fluent',
    PROFESSIONAL: 'Professional',
    CONVERSATIONAL: 'Conversational',
    BASIC: 'Basic',
};

const proficiencyWidth: Record<string, string> = {
    NATIVE: 'w-full',
    FULL_PROFESSIONAL: 'w-[85%]',
    PROFESSIONAL_WORKING: 'w-[70%]',
    LIMITED_WORKING: 'w-[50%]',
    ELEMENTARY: 'w-[30%]',
    // Fallback for old values
    FLUENT: 'w-[85%]',
    PROFESSIONAL: 'w-[70%]',
    CONVERSATIONAL: 'w-[50%]',
    BASIC: 'w-[30%]',
};

export function LanguagesSection({
    languages = [],
    onRefresh,
}: LanguagesSectionProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedLanguage, setSelectedLanguage] =
        useState<UserLanguage | null>(null);

    const handleEdit = (language: UserLanguage) => {
        setSelectedLanguage(language);
        setDialogOpen(true);
    };

    const handleAdd = () => {
        setSelectedLanguage(null);
        setDialogOpen(true);
    };

    const handleSuccess = () => {
        onRefresh();
    };

    return (
        <>
            <Card>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-purple-500/10 to-transparent rounded-full blur-3xl" />

                <div className="relative p-6 space-y-5">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg blur-md opacity-50" />
                                <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                                    <Languages className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white">
                                    Languages
                                </h2>
                                <p className="text-xs text-white/50">
                                    {languages.length} languages
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleAdd}
                            className="h-9 px-3 text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 rounded-lg"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                        </Button>
                    </div>

                    {/* Languages List */}
                    {languages.length === 0 ? (
                        <div className="text-center py-8">
                            <Languages className="w-10 h-10 text-white/20 mx-auto mb-3" />
                            <p className="text-white/60 text-sm">
                                No languages added yet.
                            </p>
                            <p className="text-white/40 text-xs">
                                Add languages you speak.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {languages.map(lang => (
                                <div
                                    key={lang.id}
                                    className="group relative rounded-lg bg-white/5 border border-white/10 p-4 hover:border-purple-500/50 hover:bg-white/[0.07] transition-all duration-300 cursor-pointer"
                                    onClick={() => handleEdit(lang)}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-base font-bold text-white">
                                                {lang.language}
                                            </span>
                                            <Badge
                                                className={`bg-gradient-to-r ${proficiencyColors[lang.proficiency]} text-white border-0 text-[10px] px-2 py-0.5`}
                                            >
                                                {
                                                    proficiencyLabels[
                                                        lang.proficiency
                                                    ]
                                                }
                                            </Badge>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0 text-white/40 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>

                                    {/* Proficiency Bar */}
                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${proficiencyWidth[lang.proficiency]} bg-gradient-to-r ${proficiencyColors[lang.proficiency]} rounded-full transition-all duration-500`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Card>

            <LanguageDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                language={selectedLanguage}
                onSuccess={handleSuccess}
            />
        </>
    );
}
