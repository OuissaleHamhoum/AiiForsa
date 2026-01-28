'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Columns, Filter, Grid3x3, Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppliedJobs } from '../context/AppliedJobsContext';

interface HeaderProps {
    currentView?: 'grid' | 'kanban' | 'calendar';
}

export function Header({ currentView }: HeaderProps) {
    const pathname = usePathname();
    const { onAddClick } = useAppliedJobs();

    // Determine active view from pathname if not explicitly provided
    const activeView =
        currentView ||
        (pathname?.includes('/calendar')
            ? 'calendar'
            : pathname?.includes('/kanban')
              ? 'kanban'
              : 'grid');

    return (
        <div className="space-y-6 mx-10 mt-8 lg:mt-12">
            {/* Title Section */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-4xl font-normal text-white mb-2">
                        Applied Jobs
                    </h1>
                    <p className="text-[#90A1B9]">
                        Track and manage your job applications
                    </p>
                </div>

                {/* Add New Job Button - Only visible in grid view */}
                {activeView === 'grid' && onAddClick && (
                    <Button
                        onClick={onAddClick}
                        className="bg-[#cf6318] hover:bg-[#b55516] text-white gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add New Job
                    </Button>
                )}
            </div>

            <Separator className="bg-white/10" />

            {/* Controls Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Search & Filter */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="border-white/20 bg-white/5 text-white hover:bg-white/10 shrink-0"
                            >
                                <Filter className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 border-white/20 bg-[#1e293b]/95 backdrop-blur-sm">
                            <div className="space-y-4">
                                <h4 className="font-medium text-white">
                                    Filters
                                </h4>
                                <div className="space-y-2">
                                    <p className="text-sm text-[#90A1B9]">
                                        Filter options coming soon...
                                    </p>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <Input
                        type="text"
                        placeholder="Search applications..."
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:border-white/40 w-full sm:w-64"
                    />
                </div>

                {/* View Toggle Buttons using Tabs */}
                <Tabs value={activeView} className="w-auto">
                    <TabsList className="bg-white/5 border border-white/10">
                        <TabsTrigger value="grid" asChild>
                            <Link
                                href="/applied-jobs/grid"
                                className="data-[state=active]:bg-button-accent data-[state=active]:text-white"
                            >
                                <Grid3x3 className="h-4 w-4 mr-2" />
                                Grid View
                            </Link>
                        </TabsTrigger>

                        <TabsTrigger value="kanban" asChild>
                            <Link
                                href="/applied-jobs/kanban"
                                className="data-[state=active]:bg-button-accent data-[state=active]:text-white"
                            >
                                <Columns className="h-4 w-4 mr-2" />
                                Kanban View
                            </Link>
                        </TabsTrigger>

                        <TabsTrigger value="calendar" asChild>
                            <Link
                                href="/applied-jobs/calendar"
                                className="data-[state=active]:bg-button-accent data-[state=active]:text-white"
                            >
                                <Calendar className="h-4 w-4 mr-2" />
                                Calendar
                            </Link>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
        </div>
    );
}
