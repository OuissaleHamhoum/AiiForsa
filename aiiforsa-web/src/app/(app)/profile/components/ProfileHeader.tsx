'use client';

import { CompleteUserProfile } from '@/actions/user-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    Activity,
    Briefcase,
    Crown,
    Edit,
    Flame,
    Github,
    Linkedin,
    MapPin,
    Share2,
    Target,
    TrendingUp,
    Users,
} from 'lucide-react';
import { useSession } from 'next-auth/react';

interface ProfileHeaderProps {
    profile?: CompleteUserProfile | null;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
    const { data: session } = useSession();

    // Get full name from profile or session
    const getFullName = (): string => {
        if (profile?.name) {
            return profile.name;
        }
        return session?.user?.name || 'User Name';
    };

    // Get initial for avatar
    const getInitial = (): string => {
        const name = getFullName();
        return name.charAt(0).toUpperCase();
    };

    // Get LinkedIn URL from social links
    const getLinkedInUrl = (): string => {
        const linkedin = profile?.socialLinks?.find(
            link => link.type === 'LINKEDIN',
        );
        return linkedin?.url || 'https://linkedin.com';
    };

    // Get GitHub URL from social links
    const getGitHubUrl = (): string => {
        const github = profile?.socialLinks?.find(
            link => link.type === 'GITHUB',
        );
        return github?.url || 'https://github.com';
    };

    // Get location
    const getLocation = (): string => {
        if (profile?.city && profile?.country) {
            return `${profile.city}, ${profile.country}`;
        }
        if (profile?.city) return profile.city;
        if (profile?.country) return profile.country;
        return 'Location not set';
    };

    // Mock data - replace with real data
    const userLevel = 7;
    const currentXP = 840;
    const nextLevelXP = 1000;
    const xpProgress = (currentXP / nextLevelXP) * 100;
    const streak = 7;
    const rank = 'Diamond';
    const connections = 234;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const endorsements = 42;

    // Stats data
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const stats = [
        {
            label: 'Applications',
            value: '24',
            change: '+12%',
            icon: Briefcase,
            color: 'from-blue-500 to-cyan-500',
        },
        {
            label: 'Interviews',
            value: '8',
            change: '+3',
            icon: Target,
            color: 'from-green-500 to-emerald-500',
        },
        {
            label: 'Profile Views',
            value: '342',
            change: '+28%',
            icon: Activity,
            color: 'from-purple-500 to-pink-500',
        },
        {
            label: 'Success Rate',
            value: '78%',
            change: '+5%',
            icon: TrendingUp,
            color: 'from-orange-500 to-red-500',
        },
    ];

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#cf6318]/20 via-[#0a0a0a] to-[#e67320]/20 border border-[#cf6318]/30 backdrop-blur-xl">
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(207,99,24,0.3),transparent_50%)]" />
            </div>

            {/* Banner */}
            <div className="relative h-32 bg-gradient-to-r from-[#cf6318] via-[#e67320] to-[#ff8c42] overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6TTI0IDM2YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNnoiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9Ii4xIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-20" />

                {/* Action Buttons - Top Right */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="w-8 h-8 text-white/80 hover:text-white hover:bg-white/20 backdrop-blur-sm"
                    >
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="w-8 h-8 text-white/80 hover:text-white hover:bg-white/20 backdrop-blur-sm"
                    >
                        <Share2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Profile Content */}
            <div className="relative px-6">
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Left Side - Profile Picture and User Info */}
                    <div className="flex-1 flex flex-col lg:flex-row gap-6">
                        {/* Profile Picture Section */}
                        <div className="flex flex-col items-center lg:items-start -mt-16 lg:-mt-12">
                            <div className="relative group/avatar">
                                {/* Outer Glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-[#cf6318] to-[#e67320] rounded-full blur-2xl opacity-50 group-hover/avatar:opacity-70 transition-opacity" />

                                {/* XP Progress Ring */}
                                <svg className="relative w-24 h-24 -rotate-90 drop-shadow-2xl">
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r="44"
                                        fill="none"
                                        stroke="rgba(10,10,10,0.8)"
                                        strokeWidth="5"
                                    />
                                    <circle
                                        cx="48"
                                        cy="48"
                                        r="44"
                                        fill="none"
                                        stroke="url(#gradientHeader)"
                                        strokeWidth="5"
                                        strokeLinecap="round"
                                        strokeDasharray={`${2 * Math.PI * 44}`}
                                        strokeDashoffset={`${2 * Math.PI * 44 * (1 - xpProgress / 100)}`}
                                        className="transition-all duration-700"
                                        style={{
                                            filter: 'drop-shadow(0 0 12px rgba(207, 99, 24, 0.8))',
                                        }}
                                    />
                                    <defs>
                                        <linearGradient
                                            id="gradientHeader"
                                            x1="0%"
                                            y1="0%"
                                            x2="100%"
                                            y2="100%"
                                        >
                                            <stop
                                                offset="0%"
                                                stopColor="#cf6318"
                                            />
                                            <stop
                                                offset="50%"
                                                stopColor="#e67320"
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor="#ff8c42"
                                            />
                                        </linearGradient>
                                    </defs>
                                </svg>

                                {/* Profile Picture */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#cf6318] via-[#e67320] to-[#ff8c42] flex items-center justify-center text-3xl font-black text-white shadow-2xl ring-4 ring-[#0a0a0a] group-hover/avatar:scale-105 transition-transform duration-300">
                                        {getInitial()}
                                    </div>
                                </div>

                                {/* Level Badge - Only Number */}
                                <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-r from-[#cf6318] via-[#e67320] to-[#ff8c42] border-3 border-[#0a0a0a] shadow-2xl">
                                    <span className="text-sm font-black text-white">
                                        {userLevel}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 space-y-4 text-center lg:text-left">
                            <div className="space-y-2">
                                <div className="flex items-center justify-center lg:justify-start gap-3 flex-wrap">
                                    <h1 className="text-3xl font-black text-white">
                                        {getFullName()}
                                    </h1>
                                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-3 py-1">
                                        <Crown className="w-3.5 h-3.5 mr-1" />
                                        {rank}
                                    </Badge>
                                </div>
                                <p className="text-white/70">
                                    {profile?.headline ||
                                        profile?.currentPosition ||
                                        'Professional'}
                                </p>
                                <div className="flex items-center justify-center lg:justify-start gap-2 text-sm text-white/60">
                                    <MapPin className="w-4 h-4" />
                                    <span>{getLocation()}</span>
                                </div>
                            </div>

                            {/* Connections - Smaller */}
                            <div className="flex items-center justify-center lg:justify-start">
                                <div className="flex items-center gap-1.5">
                                    <Users className="w-4 h-4 text-[#cf6318]" />
                                    <span className="text-lg font-black text-white">
                                        {connections}
                                    </span>
                                    <span className="text-xs text-white/60">
                                        Connections
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Certifications */}
                    <div className="flex flex-col items-end gap-4">
                        {/* Certifications Badges - Moved to bottom */}
                    </div>

                    {/* Streak Badge & Social Links - Top Right Corner */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                        {/* Social Links */}
                        <Button
                            size="icon"
                            variant="ghost"
                            className="w-7 h-7 text-white/70 hover:text-white hover:bg-white/10 backdrop-blur-sm"
                            asChild
                        >
                            <a
                                href={getLinkedInUrl()}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Linkedin className="w-3.5 h-3.5" />
                            </a>
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="w-7 h-7 text-white/70 hover:text-white hover:bg-white/10 backdrop-blur-sm"
                            asChild
                        >
                            <a
                                href={getGitHubUrl()}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Github className="w-3.5 h-3.5" />
                            </a>
                        </Button>

                        {/* Streak Badge */}
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 shadow-lg border border-orange-400/50">
                            <Flame className="w-3.5 h-3.5 text-white animate-pulse" />
                            <span className="text-sm font-black text-white">
                                {streak}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Certifications Badges - Bottom Right Section */}
                <div className="flex justify-end relative bottom-5">
                    <TooltipProvider>
                        <div className="flex items-center gap-4">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <a
                                        href="https://learn.microsoft.com/en-us/users/certifications/verify"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="relative group cursor-pointer"
                                    >
                                        <div className="w-14 h-14 rounded-lg flex items-center justify-center  group-hover:scale-110 transition-transform  bg-transparent">
                                            <img
                                                src="/badges/azure.png"
                                                alt="Microsoft Azure Certification"
                                                className="w-full h-full object-contain rounded-lg"
                                            />
                                        </div>
                                    </a>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Microsoft Azure Fundamentals (AZ-900)</p>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <a
                                        href="https://aws.amazon.com/verification"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="relative group cursor-pointer"
                                    >
                                        <div className="w-14 h-14 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden bg-transparent">
                                            <img
                                                src="/badges/aws.png"
                                                alt="AWS Certification"
                                                className="w-full h-full object-contain rounded-lg"
                                            />
                                        </div>
                                    </a>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>AWS Certified Cloud Practitioner</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </TooltipProvider>
                </div>
            </div>
        </div>
    );
}
