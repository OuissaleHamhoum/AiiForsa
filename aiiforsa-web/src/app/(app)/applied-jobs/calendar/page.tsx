'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useJobApplications } from '@/hooks/useJobApplications';
import { useMemo, useState } from 'react';
import { Schedule } from './components/schedule';
import { Today } from './components/today';
import { Upcoming } from './components/upcoming';

// Interview data structure
// TODO: Create backend endpoints for interviews when interview scheduling is implemented
interface Interview {
    id: string;
    jobTitle: string;
    company: string;
    date: Date;
    time: string;
}

export default function CalendarPage() {
    const { applications, loading, error } = useJobApplications();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        new Date(), // Today's date
    );

    // Mock interviews based on actual job applications with "interview" status
    // TODO: Replace with actual interview data from backend when available
    const interviews = useMemo<Interview[]>(() => {
        return applications
            .filter(app => app.status === 'interview')
            .map((app, index) => {
                // Create mock interview dates based on application date
                const appliedDate = new Date(app.appliedAt);
                const interviewDate = new Date(appliedDate);
                interviewDate.setDate(appliedDate.getDate() + 7 + index * 3); // Mock: 7 days after application

                return {
                    id: app.applicationId,
                    jobTitle: app.title,
                    company: app.company,
                    date: interviewDate,
                    time: ['10:00 AM', '2:00 PM', '11:30 AM', '3:30 PM'][
                        index % 4
                    ],
                };
            });
    }, [applications]);

    // Get interviews for selected date
    const selectedDateInterviews = useMemo(() => {
        if (!selectedDate) return [];
        return interviews.filter(interview => {
            return (
                interview.date.getDate() === selectedDate.getDate() &&
                interview.date.getMonth() === selectedDate.getMonth() &&
                interview.date.getFullYear() === selectedDate.getFullYear()
            );
        });
    }, [interviews, selectedDate]);

    // Get dates that have interviews
    const datesWithInterviews = useMemo(() => {
        return interviews.map(i => i.date);
    }, [interviews]);

    if (loading) {
        return (
            <div className="mx-10 mt-8 pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
                    {/* Left Column - Schedule Skeleton */}
                    <div className="border-white/10 border bg-[#1a1a1a]/80 backdrop-blur-sm rounded-lg">
                        <div className="p-6 pb-4 border-b border-white/5">
                            <Skeleton className="h-6 w-40 mb-2 bg-white/5" />
                            <Skeleton className="h-4 w-32 bg-white/5" />
                        </div>
                        <div className="p-6">
                            <div className="space-y-4">
                                <Skeleton className="h-8 w-full bg-white/5" />
                                <div className="grid grid-cols-7 gap-1">
                                    {[...Array(35)].map((_, i) => (
                                        <Skeleton
                                            key={i}
                                            className="h-10 w-10 rounded-md bg-white/5"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Today Skeleton */}
                    <div className="border-white/10 border bg-[#1a1a1a]/60 backdrop-blur-sm rounded-lg">
                        <div className="p-6">
                            <Skeleton className="h-6 w-64 mb-4 bg-white/5" />
                            <div className="space-y-3">
                                {[...Array(2)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="border border-white/10 bg-white/5 rounded-lg p-4"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-2 flex-1">
                                                <Skeleton className="h-5 w-3/4 bg-white/5" />
                                                <Skeleton className="h-4 w-1/2 bg-white/5" />
                                            </div>
                                            <Skeleton className="h-6 w-16 rounded-full bg-white/5" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Full Width - Upcoming Skeleton */}
                <div className="mt-6 border-white/10 border bg-[#1a1a1a]/60 backdrop-blur-sm rounded-lg">
                    <div className="p-6">
                        <Skeleton className="h-6 w-48 mb-4 bg-white/5" />
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="border border-white/10 bg-[#2a2a2a]/40 rounded-lg p-4"
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-5 w-2/3 bg-white/5" />
                                            <Skeleton className="h-4 w-1/3 bg-white/5" />
                                        </div>
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-16 bg-white/5" />
                                            <Skeleton className="h-3 w-12 bg-white/5" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-10 mt-8 pb-8">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-red-500">Error: {error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-10 mt-8 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
                {/* Left Column - Interview Schedule */}
                <Schedule
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                    interviewDates={datesWithInterviews}
                    interviewCount={interviews.length}
                />

                {/* Right Column - Today's Interviews */}
                <Today
                    selectedDate={selectedDate}
                    interviews={selectedDateInterviews}
                />
            </div>

            {/* Full Width - All Upcoming Interviews */}
            <div className="mt-6">
                <Upcoming interviews={interviews} />
            </div>
        </div>
    );
}
