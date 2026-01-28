'use client';

import { UserWorkExperience } from '@/actions/user-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Briefcase,
    Calendar,
    ChevronDown,
    ChevronUp,
    Edit,
    ExternalLink,
    MapPin,
    Plus,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import { ExperienceDialog } from './dialogs';

interface ExperienceSectionProps {
    workExperiences?: UserWorkExperience[];
    onRefresh: () => void;
}

export function ExperienceSection({
    workExperiences = [],
    onRefresh,
}: ExperienceSectionProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedExperience, setSelectedExperience] =
        useState<UserWorkExperience | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    // Format date for display
    const formatDate = (dateString: string | undefined): string => {
        if (!dateString) return 'Present';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
        });
    };

    // Get company initials for logo
    const getCompanyInitials = (company: string): string => {
        return company
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleEdit = (exp: UserWorkExperience) => {
        setSelectedExperience(exp);
        setDialogOpen(true);
    };

    const handleAdd = () => {
        setSelectedExperience(null);
        setDialogOpen(true);
    };

    const handleSuccess = () => {
        onRefresh();
    };

    const experiences = workExperiences.map(exp => ({
        original: exp,
        id: exp.id,
        logo: getCompanyInitials(exp.company),
        position: exp.jobTitle,
        company: exp.company,
        type: 'Full-time',
        locationDisplay: exp.location || 'Remote',
        startDateDisplay: formatDate(exp.startDate),
        endDateDisplay: exp.isCurrent ? 'Present' : formatDate(exp.endDate),
        current: exp.isCurrent,
        descriptionDisplay: exp.description || '',
        achievements: [] as string[],
    }));

    return (
        <>
            <Card>
                {/* Enhanced ambient glow effects */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#cf6318]/10 via-[#e67320]/5 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/5 to-transparent rounded-full blur-2xl" />

                <div className="relative p-6 space-y-5">
                    {/* Enhanced Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg blur-md opacity-50" />
                                <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                                    <Briefcase className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white">
                                    Experience
                                </h2>
                                <p className="text-xs text-white/50">
                                    {experiences.length} positions
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

                    {/* Enhanced Timeline */}
                    {experiences.length === 0 ? (
                        <div className="text-center py-12">
                            <Briefcase className="w-12 h-12 text-white/20 mx-auto mb-4" />
                            <p className="text-white/60">
                                No work experience yet.
                            </p>
                            <p className="text-white/40 text-sm">
                                Add your work history to showcase your career.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {experiences.map(exp => {
                                const isExpanded = expandedId === exp.id;

                                return (
                                    <div key={exp.id} className="relative">
                                        {/* Enhanced Timeline line with gradient */}

                                        {/* Enhanced Experience Card */}
                                        <div className="group relative rounded-xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/10 overflow-hidden hover:border-[#cf6318]/50 hover:shadow-lg hover:shadow-[#cf6318]/10 transition-all duration-300">
                                            {/* Hover gradient overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-[#cf6318]/0 via-[#cf6318]/5 to-[#cf6318]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                            {/* Clickable Header - Enhanced */}
                                            <button
                                                onClick={() =>
                                                    toggleExpand(exp.id)
                                                }
                                                className="relative w-full p-5 flex gap-4 items-start text-left hover:bg-white/5 transition-colors duration-200"
                                            >
                                                {/* Enhanced Company Logo with glow */}
                                                <div className="flex-shrink-0 relative">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-[#cf6318] to-[#e67320] rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                                                    <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#cf6318] to-[#e67320] flex items-center justify-center text-white font-black text-base shadow-lg group-hover:scale-105 transition-transform duration-300">
                                                        {exp.logo}
                                                    </div>
                                                </div>

                                                {/* Enhanced Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-3 mb-2">
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-base font-bold text-white group-hover:text-[#cf6318] transition-colors duration-300 mb-1">
                                                                {exp.position}
                                                            </h3>
                                                            <p className="text-sm text-white/80 font-semibold">
                                                                {exp.company}
                                                            </p>
                                                        </div>
                                                        {exp.current && (
                                                            <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/40 text-green-400 text-[10px] px-2.5 py-1 font-semibold shadow-lg shadow-green-500/10">
                                                                <span className="relative flex h-2 w-2 mr-1.5">
                                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                                </span>
                                                                Current
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {/* Enhanced metadata with better spacing */}
                                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/60">
                                                        <div className="flex items-center gap-1.5">
                                                            <Calendar className="w-3.5 h-3.5 text-[#cf6318]" />
                                                            <span className="font-medium">
                                                                {
                                                                    exp.startDateDisplay
                                                                }{' '}
                                                                -{' '}
                                                                {
                                                                    exp.endDateDisplay
                                                                }
                                                            </span>
                                                        </div>
                                                        <span className="text-white/30">
                                                            •
                                                        </span>
                                                        <div className="flex items-center gap-1.5">
                                                            <MapPin className="w-3.5 h-3.5 text-blue-400" />
                                                            <span className="font-medium">
                                                                {
                                                                    exp.locationDisplay
                                                                }
                                                            </span>
                                                        </div>
                                                        <span className="text-white/30">
                                                            •
                                                        </span>
                                                        <Badge className="bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] px-2 py-0.5 font-medium">
                                                            {exp.type}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                {/* Enhanced Expand Icon */}
                                                <div className="flex-shrink-0 mt-1">
                                                    <div
                                                        className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all duration-300 ${isExpanded ? 'bg-[#cf6318]/20 border border-[#cf6318]/30' : ''}`}
                                                    >
                                                        {isExpanded ? (
                                                            <ChevronUp className="w-5 h-5 text-[#cf6318]" />
                                                        ) : (
                                                            <ChevronDown className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                                                        )}
                                                    </div>
                                                </div>
                                            </button>

                                            {/* Enhanced Expandable Content */}
                                            {isExpanded && (
                                                <div className="relative px-5 pb-5 space-y-4 border-t border-white/10 bg-gradient-to-b from-white/5 to-transparent animate-in slide-in-from-top-2 duration-300">
                                                    <div className="pt-4 space-y-4">
                                                        {/* Description with better styling */}
                                                        <div className="relative pl-4 border-l-2 border-[#cf6318]/50">
                                                            <p className="text-sm text-white/80 leading-relaxed">
                                                                {
                                                                    exp.descriptionDisplay
                                                                }
                                                            </p>
                                                        </div>

                                                        {/* Enhanced Achievements Section */}
                                                        <div className="space-y-3 p-4 rounded-lg bg-gradient-to-br from-[#cf6318]/5 to-transparent border border-[#cf6318]/20">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#cf6318] to-[#e67320] flex items-center justify-center">
                                                                    <TrendingUp className="w-3.5 h-3.5 text-white" />
                                                                </div>
                                                                <p className="text-sm font-bold text-white">
                                                                    Key
                                                                    Achievements
                                                                </p>
                                                            </div>
                                                            <ul className="space-y-2">
                                                                {exp.achievements &&
                                                                    exp.achievements.map(
                                                                        (
                                                                            achievement,
                                                                            idx,
                                                                        ) => (
                                                                            <li
                                                                                key={
                                                                                    idx
                                                                                }
                                                                                className="flex items-start gap-3 text-sm text-white/70 group/item hover:text-white/90 transition-colors"
                                                                            >
                                                                                <div className="flex-shrink-0 mt-1.5">
                                                                                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#cf6318] to-[#e67320] group-hover/item:scale-125 transition-transform" />
                                                                                </div>
                                                                                <span className="flex-1">
                                                                                    {
                                                                                        achievement
                                                                                    }
                                                                                </span>
                                                                            </li>
                                                                        ),
                                                                    )}
                                                            </ul>
                                                        </div>

                                                        {/* Enhanced Action Button */}
                                                        <div className="flex gap-2 pt-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-9 px-4 text-white/70 hover:text-white hover:bg-white/10 text-xs font-medium rounded-lg transition-all duration-300 group/btn"
                                                                onClick={e => {
                                                                    e.stopPropagation();
                                                                    handleEdit(
                                                                        exp.original,
                                                                    );
                                                                }}
                                                            >
                                                                <Edit className="w-3.5 h-3.5 mr-2" />
                                                                Edit Experience
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-9 px-4 text-white/70 hover:text-white hover:bg-white/10 text-xs font-medium rounded-lg transition-all duration-300 group/btn"
                                                            >
                                                                <ExternalLink className="w-3.5 h-3.5 mr-2 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                                                View Company
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

            <ExperienceDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                experience={selectedExperience}
                onSuccess={handleSuccess}
            />
        </>
    );
}
