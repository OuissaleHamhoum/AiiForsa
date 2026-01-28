import clsx from 'clsx';
import { motion } from 'framer-motion';
import { HelpCircle, Settings } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTutorial } from '@/components/tutorial/TutorialContext';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

export type HeaderTab =
    | 'SEARCH'
    | 'APPLIED'
    | 'JOBS'
    | 'APPLY'
    | 'ADVISOR'
    | 'INTERVIEW'
    | 'LEARN'
    | 'RESUME'
    | 'CHALLENGE'
    | 'COMMUNITY';

interface AppHeaderProps {
    active?: HeaderTab;
}

const tabs: HeaderTab[] = [
    'ADVISOR',
    'INTERVIEW',
    'RESUME',
    'JOBS',
    'APPLIED',
    'LEARN',
    'CHALLENGE',
    'COMMUNITY',
];

export function AppHeader({ active = 'APPLIED' }: AppHeaderProps) {
    const router = useRouter();
    const { triggerTutorial, isTutorialCompleted } = useTutorial();
    const [showTutorialMenu, setShowTutorialMenu] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full select-none border-b border-white/5 bg-gradient-to-b from-[#0a0a0a]/98 to-[#0a0a0a]/90 backdrop-blur-xl supports-[backdrop-filter]:backdrop-blur-xl shadow-xl shadow-black/20" data-tutorial="navbar">
            <div className="relative mx-auto max-w-full px-3 py-2 md:px-6">
                <Link
                    href="/"
                    className="absolute left-3 md:left-6 top-1/2 transform -translate-y-1/2 flex items-center gap-2 group"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#cf6318] to-[#cf6318] blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            width={140}
                            height={150}
                            className="relative rounded transition-transform group-hover:scale-105"
                        />
                    </div>
                </Link>

                <nav className="flex items-center justify-center gap-4 md:gap-6">
                    {tabs.map(tab => (
                        <NavChip
                            key={tab}
                            href={getHref(tab)}
                            label={tab}
                            active={active === tab}
                        />
                    ))}
                </nav>

                <Popover open={showTutorialMenu} onOpenChange={setShowTutorialMenu}>
                    <PopoverTrigger asChild>
                        <button className="absolute right-3 md:right-6 top-1/2 transform -translate-y-1/2 flex items-center justify-center h-8 w-8 rounded-md transition-all hover:bg-white/10 active:scale-95 text-white/60 hover:text-white">
                            <HelpCircle className="h-4 w-4" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-2 bg-[#1a1a1a]/95 backdrop-blur-xl border-white/10" align="end">
                        <div className="space-y-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
                                onClick={() => {
                                    triggerTutorial('welcome');
                                    setShowTutorialMenu(false);
                                }}
                            >
                                Welcome Tutorial
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
                <button className="absolute right-12 md:right-16 top-1/2 transform -translate-y-1/2 flex items-center justify-center h-8 w-8 rounded-md transition-all hover:bg-white/10 active:scale-95 text-white/60 hover:text-white">
                    <Settings className="h-4 w-4" />
                </button>
            </div>
        </header>
    );
}

function getHref(tab: HeaderTab): string {
    switch (tab) {
        case 'APPLIED':
            return '/applied-jobs';
        case 'SEARCH':
            return '/job';
        case 'JOBS':
            // 'JOBS' is an alternative label for the job listing page
            return '/job';
        case 'APPLY':
            // There is no dedicated apply page — send users to job listing where they can apply
            return '/job';
        case 'ADVISOR':
            // Career advisor feature
            return '/advisor';
        case 'INTERVIEW':
            return '/interview';
        case 'LEARN':
            return '/learning-hub';
        case 'RESUME':
            return '/resume-builder';
        case 'CHALLENGE':
            return '/challenge';
        case 'COMMUNITY':
            return '/community';
        default:
            return '#';
    }
}

function NavChip({
    href,
    label,
    active,
}: {
    href: string;
    label: string;
    active?: boolean;
}) {
    const isPlayButton = label === 'APPLIED';

    if (isPlayButton) {
        return (
            <Link
                href={href}
                className="relative block overflow-visible px-12 py-2 text-base tracking-[0.3em] md:px-20 md:text-lg -my-4 transition-all hover:scale-100 active:scale-105 group"
                style={{
                    clipPath: 'polygon(19% 100%, 77% 100%, 96% 0, 0 0)',
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-[#cf6318] via-[#cf6318] to-[#cf6318] opacity-100 group-hover:opacity-80 transition-opacity -z-10" />
                <span className="relative z-[1] uppercase text-3xl text-white drop-shadow-2xl tracking-[0.2em] font-bold">
                    {label}
                </span>
            </Link>
        );
    }

    return (
        <Link
            href={href}
            className={clsx(
                'relative block overflow-hidden px-4 py-2 text-[11px] tracking-[0.22em] md:px-6 md:text-xs transition-all',
                'uppercase text-white/50 hover:text-white',
                'before:absolute before:inset-0 before:-skew-x-[22deg] before:rounded before:bg-white/0 before:ring-1 before:ring-white/5 before:transition-all',
                'hover:before:bg-white/10 hover:before:ring-white/10 active:scale-95',
                active &&
                    'text-[#0a0a0a] drop-shadow-sm before:bg-white before:ring-0 hover:before:bg-white before:shadow-lg',
            )}
        >
            <span className="relative z-[1]">{label}</span>
            {active && (
                <motion.span
                    layoutId="active-underline"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="absolute inset-x-6 bottom-1 h-[3px] rounded-full bg-[#0a0a0a]/70 md:inset-x-8"
                />
            )}
        </Link>
    );
}
