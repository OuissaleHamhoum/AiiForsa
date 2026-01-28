'use client';

import { CompleteUserProfile, UserSkill } from '@/actions/user-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    ArrowRight,
    Briefcase,
    Calendar,
    Edit,
    GraduationCap,
    Mail,
    Phone,
    Plus,
    Sparkles,
    Trophy,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { SkillDialog } from './dialogs';

interface AboutSectionProps {
    profile?: CompleteUserProfile | null;
    onRefresh: () => void;
}

export function AboutSection({ profile, onRefresh }: AboutSectionProps) {
    const [skillDialogOpen, setSkillDialogOpen] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState<UserSkill | null>(null);

    const handleEditSkill = (skill: UserSkill) => {
        setSelectedSkill(skill);
        setSkillDialogOpen(true);
    };

    const handleAddSkill = () => {
        setSelectedSkill(null);
        setSkillDialogOpen(true);
    };

    const handleSkillSuccess = () => {
        onRefresh();
    };
    // Calculate years of experience from work experiences
    const calculateExperience = (): string => {
        if (!profile?.workExperiences || profile.workExperiences.length === 0) {
            return 'N/A';
        }

        const now = new Date();
        let totalMonths = 0;

        profile.workExperiences.forEach(exp => {
            const startDate = new Date(exp.startDate);
            const endDate =
                exp.isCurrent || !exp.endDate ? now : new Date(exp.endDate);
            const months =
                (endDate.getFullYear() - startDate.getFullYear()) * 12 +
                (endDate.getMonth() - startDate.getMonth());
            totalMonths += Math.max(0, months);
        });

        const years = Math.floor(totalMonths / 12);
        if (years === 0) return 'Less than 1 year';
        if (years === 1) return '1 year';
        return `${years}+ years`;
    };

    // Get latest education
    const getLatestEducation = (): string => {
        if (!profile?.educations || profile.educations.length === 0) {
            return 'N/A';
        }
        const sorted = [...profile.educations].sort(
            (a, b) =>
                new Date(b.startDate).getTime() -
                new Date(a.startDate).getTime(),
        );
        return `${sorted[0].degree}${sorted[0].fieldOfStudy ? ` in ${sorted[0].fieldOfStudy}` : ''}`;
    };

    // Format join date
    const formatJoinDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
        });
    };

    // Use real data from profile with fallbacks
    const about = {
        bio:
            profile?.bio ||
            profile?.professionalSummary ||
            'No bio available. Edit your profile to add a bio.',
        email: profile?.email || 'N/A',
        phone: profile?.phone || 'N/A',
        experience: profile?.yearsExperience
            ? `${profile.yearsExperience}+ years`
            : calculateExperience(),
        education: getLatestEducation(),
        joinedDate: profile?.createdAt
            ? formatJoinDate(profile.createdAt)
            : 'N/A',
    };

    // Group skills by category - preserve original skill data
    const groupSkillsByCategory = () => {
        if (!profile?.skills || profile.skills.length === 0) {
            return [];
        }

        const grouped: { [key: string]: UserSkill[] } = {};
        profile.skills.forEach(skill => {
            const category = skill.category || 'Other';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(skill);
        });

        const colors = [
            'from-blue-500 to-cyan-500',
            'from-green-500 to-emerald-500',
            'from-orange-500 to-red-500',
            'from-purple-500 to-pink-500',
        ];

        return Object.entries(grouped).map(([category, skills], index) => ({
            category,
            color: colors[index % colors.length],
            skills,
        }));
    };

    const skillCategories = groupSkillsByCategory();

    const interests = [
        'AI & Machine Learning',
        'Cloud Architecture',
        'Open Source',
        'DevOps',
        'Web3',
        'Mobile Development',
    ];

    return (
        <div className="space-y-4">
            {/* About Card - Enhanced */}
            <Card className="relative overflow-hidden">
                {/* Ambient glow effects */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#cf6318]/10 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#e67320]/10 to-transparent rounded-full blur-2xl" />

                <div className="relative p-5 space-y-6">
                    {/* Header - Cleaner */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#cf6318] to-[#e67320] flex items-center justify-center shadow-lg">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <h2 className="text-xl font-black text-white">
                                About
                            </h2>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-white/50 hover:text-white hover:bg-white/5 transition-all"
                        >
                            <Edit className="w-3.5 h-3.5" />
                        </Button>
                    </div>

                    {/* Contact & Details Section - Simplified */}
                    <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-2">
                            {/* Email */}
                            <div className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all duration-300 cursor-pointer">
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                    <Mail className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-medium text-white/40 uppercase tracking-wide">
                                        Email
                                    </p>
                                    <p className="text-sm font-medium text-white truncate">
                                        {about.email}
                                    </p>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="group flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-all duration-300 cursor-pointer">
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                    <Phone className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-medium text-white/40 uppercase tracking-wide">
                                        Phone
                                    </p>
                                    <p className="text-sm font-medium text-white truncate">
                                        {about.phone}
                                    </p>
                                </div>
                            </div>

                            {/* Experience & Education - Two columns */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="group flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-all duration-300 cursor-pointer">
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                        <Briefcase className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[9px] font-medium text-white/40 uppercase tracking-wide">
                                            Experience
                                        </p>
                                        <p className="text-xs font-semibold text-white">
                                            {about.experience}
                                        </p>
                                    </div>
                                </div>

                                <div className="group flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-all duration-300 cursor-pointer">
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                        <GraduationCap className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[9px] font-medium text-white/40 uppercase tracking-wide">
                                            Education
                                        </p>
                                        <p className="text-xs font-semibold text-white truncate">
                                            {about.education}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bio - Better typography */}
                    <div className="relative">
                        <p className="text-sm text-white/70 leading-relaxed">
                            {about.bio}
                        </p>
                        <div className="absolute bottom-0 right-0 w-20 h-1 bg-gradient-to-r from-transparent via-[#cf6318]/50 to-transparent rounded-full mt-3" />
                    </div>

                    {/* Member since badge */}
                    <div className="flex items-center gap-2 text-xs text-white/50">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Member since {about.joinedDate}</span>
                    </div>

                    {/* Interests Section */}
                    <div className="space-y-3 pt-4 border-t border-white/10">
                        <h3 className="text-sm font-bold text-white/80">
                            Interests
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {interests.map((interest, index) => (
                                <Badge
                                    key={index}
                                    className="group relative px-3 py-1.5 bg-white/5 border border-white/10 text-white hover:bg-gradient-to-r hover:from-[#cf6318] hover:to-[#e67320] hover:border-[#cf6318] hover:scale-105 hover:shadow-lg hover:shadow-[#cf6318]/20 transition-all duration-300 cursor-pointer text-xs font-medium"
                                >
                                    <span className="relative z-10">
                                        {interest}
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#cf6318]/20 to-[#e67320]/20 rounded-md opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Achievements Section */}
                    <div className="space-y-4 pt-4 border-t border-white/10">
                        <Link
                            href="/profile/achievements"
                            className="block group"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <Trophy className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-white group-hover:text-[#cf6318] transition-colors">
                                            Achievements
                                        </h3>
                                        <p className="text-xs text-white/60">
                                            View all your unlocked achievements
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-white/5">
                                <div>
                                    <p className="text-lg font-black text-white">
                                        50%
                                    </p>
                                    <p className="text-[10px] text-white/50">
                                        Complete
                                    </p>
                                </div>
                                <div>
                                    <p className="text-lg font-black text-white">
                                        3/6
                                    </p>
                                    <p className="text-[10px] text-white/50">
                                        Unlocked
                                    </p>
                                </div>
                                <div>
                                    <p className="text-lg font-black text-white">
                                        400
                                    </p>
                                    <p className="text-[10px] text-white/50">
                                        Total XP
                                    </p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </Card>

            {/* Skills Card - Categorized with chips */}
            <Card>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-[#e67320]/10 to-transparent rounded-full blur-3xl" />

                <div className="relative p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-white">
                            Skills & Expertise
                        </h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-white/50 hover:text-white hover:bg-white/5 transition-all"
                            onClick={handleAddSkill}
                        >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Add
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {skillCategories.map((category, index) => (
                            <div
                                key={index}
                                className="group relative overflow-hidden rounded-lg bg-white/5 border border-white/5 p-4 hover:bg-white/10 hover:border-[#cf6318]/30 transition-all duration-300"
                            >
                                {/* Hover gradient effect */}
                                <div
                                    className={`absolute inset-0 bg-gradient-to-r ${category.color} opacity-0 group-hover:opacity-5 transition-opacity`}
                                />

                                <div className="relative space-y-3">
                                    {/* Category Header */}
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-sm text-white">
                                            {category.category}
                                        </h3>
                                    </div>

                                    {/* Skills chips */}
                                    <div className="flex flex-wrap gap-2">
                                        {category.skills.map(
                                            (skill, skillIndex) => (
                                                <Badge
                                                    key={skillIndex}
                                                    className="px-3 py-1.5 bg-gradient-to-r from-[#cf6318] to-[#e67320] text-white border-0 text-xs font-medium shadow-md hover:scale-105 hover:shadow-lg hover:shadow-[#cf6318]/20 transition-all duration-300 cursor-pointer"
                                                    onClick={() =>
                                                        handleEditSkill(skill)
                                                    }
                                                >
                                                    {skill.name}
                                                </Badge>
                                            ),
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            <SkillDialog
                open={skillDialogOpen}
                onOpenChange={setSkillDialogOpen}
                skill={selectedSkill}
                onSuccess={handleSkillSuccess}
            />
        </div>
    );
}
