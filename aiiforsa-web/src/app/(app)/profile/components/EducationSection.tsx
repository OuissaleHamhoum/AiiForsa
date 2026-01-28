'use client';

import { UserEducation } from '@/actions/user-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Calendar,
    ChevronDown,
    ChevronUp,
    Edit,
    GraduationCap,
    MapPin,
    Plus,
} from 'lucide-react';
import { useState } from 'react';
import { EducationDialog } from './dialogs';

interface EducationSectionProps {
    educations?: UserEducation[];
    onRefresh: () => void;
}

export function EducationSection({
    educations = [],
    onRefresh,
}: EducationSectionProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedEducation, setSelectedEducation] =
        useState<UserEducation | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const formatDate = (dateString: string | undefined): string => {
        if (!dateString) return 'Present';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
        });
    };

    const getInstitutionInitials = (institution: string): string => {
        return institution
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleEdit = (education: UserEducation) => {
        setSelectedEducation(education);
        setDialogOpen(true);
    };

    const handleAdd = () => {
        setSelectedEducation(null);
        setDialogOpen(true);
    };

    const handleSuccess = () => {
        onRefresh();
    };

    return (
        <>
            <Card>
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent rounded-full blur-3xl" />

                <div className="relative p-6 space-y-5">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg blur-md opacity-50" />
                                <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                                    <GraduationCap className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white">
                                    Education
                                </h2>
                                <p className="text-xs text-white/50">
                                    {educations.length} entries
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

                    {/* Education List */}
                    {educations.length === 0 ? (
                        <div className="text-center py-12">
                            <GraduationCap className="w-12 h-12 text-white/20 mx-auto mb-4" />
                            <p className="text-white/60">
                                No education added yet.
                            </p>
                            <p className="text-white/40 text-sm">
                                Add your educational background.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {educations.map(edu => {
                                const isExpanded = expandedId === edu.id;

                                return (
                                    <div key={edu.id} className="relative">
                                        <div className="group relative rounded-xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 overflow-hidden hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
                                            <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/5 to-green-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                            <button
                                                onClick={() =>
                                                    toggleExpand(edu.id)
                                                }
                                                className="relative w-full p-5 flex gap-4 items-start text-left hover:bg-white/5 transition-colors duration-200"
                                            >
                                                <div className="flex-shrink-0 relative">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                                                    <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-black text-base shadow-lg group-hover:scale-105 transition-transform duration-300">
                                                        {getInstitutionInitials(
                                                            edu.institution,
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-3 mb-2">
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-base font-bold text-white group-hover:text-green-400 transition-colors duration-300 mb-1">
                                                                {edu.degree}
                                                                {edu.fieldOfStudy && (
                                                                    <span className="text-white/60 font-normal">
                                                                        {' '}
                                                                        in{' '}
                                                                        {
                                                                            edu.fieldOfStudy
                                                                        }
                                                                    </span>
                                                                )}
                                                            </h3>
                                                            <p className="text-sm text-white/80 font-semibold">
                                                                {
                                                                    edu.institution
                                                                }
                                                            </p>
                                                        </div>
                                                        {edu.isCurrent && (
                                                            <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40 text-green-400 text-[10px] px-2.5 py-1 font-semibold">
                                                                <span className="relative flex h-2 w-2 mr-1.5">
                                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                                </span>
                                                                Current
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/60">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="w-3.5 h-3.5 text-green-400" />
                                                            <span className="font-medium">
                                                                {formatDate(
                                                                    edu.startDate,
                                                                )}{' '}
                                                                -{' '}
                                                                {edu.isCurrent
                                                                    ? 'Present'
                                                                    : formatDate(
                                                                          edu.endDate,
                                                                      )}
                                                            </span>
                                                        </div>
                                                        {edu.location && (
                                                            <>
                                                                <span className="text-white/30">
                                                                    •
                                                                </span>
                                                                <div className="flex items-center gap-1.5">
                                                                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                                                                    <span className="font-medium">
                                                                        {
                                                                            edu.location
                                                                        }
                                                                    </span>
                                                                </div>
                                                            </>
                                                        )}
                                                        {edu.gpa && (
                                                            <>
                                                                <span className="text-white/30">
                                                                    •
                                                                </span>
                                                                <Badge className="bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] px-2 py-0.5 font-medium">
                                                                    GPA:{' '}
                                                                    {edu.gpa}
                                                                </Badge>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex-shrink-0 mt-1">
                                                    <div
                                                        className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all duration-300 ${isExpanded ? 'bg-green-500/20 border border-green-500/30' : ''}`}
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronUp className="w-5 h-5 text-green-400" />
                                                        ) : (
                                                            <ChevronDown className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                                                        )}
                                                    </div>
                                                </div>
                                            </button>

                                            {isExpanded && (
                                                <div className="relative px-5 pb-5 space-y-4 border-t border-white/10 bg-gradient-to-b from-white/5 to-transparent animate-in slide-in-from-top-2 duration-300">
                                                    <div className="pt-4 space-y-4">
                                                        {edu.description && (
                                                            <div className="relative pl-4 border-l-2 border-green-500/50">
                                                                <p className="text-sm text-white/80 leading-relaxed">
                                                                    {
                                                                        edu.description
                                                                    }
                                                                </p>
                                                            </div>
                                                        )}
                                                        <div className="flex gap-2 pt-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        edu,
                                                                    )
                                                                }
                                                                className="h-9 px-4 text-white/70 hover:text-white hover:bg-white/10 text-xs font-medium rounded-lg transition-all duration-300"
                                                            >
                                                                <Edit className="w-3.5 h-3.5 mr-2" />
                                                                Edit
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </Card>

            <EducationDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                education={selectedEducation}
                onSuccess={handleSuccess}
            />
        </>
    );
}
