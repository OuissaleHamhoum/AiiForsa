'use client';

import { PageTitle } from '@/components/business/PageTitle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, Video } from 'lucide-react';

export default function AgendaPage() {
    const upcomingInterviews = [
        {
            id: '1',
            candidate: 'Sarah Chen',
            position: 'Senior Developer',
            date: 'Today',
            time: '2:00 PM',
            duration: '45 min',
            type: 'video',
        },
        {
            id: '2',
            candidate: 'Mike Johnson',
            position: 'Product Designer',
            date: 'Tomorrow',
            time: '10:00 AM',
            duration: '1 hour',
            type: 'video',
        },
        {
            id: '3',
            candidate: 'Emma Davis',
            position: 'Marketing Manager',
            date: 'Dec 12',
            time: '3:30 PM',
            duration: '30 min',
            type: 'phone',
        },
    ];

    return (
        <div className="space-y-6">
            <PageTitle
                title="Agenda"
                description="Manage interviews and calendar events"
                action={
                    <Button variant="outline">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        View Full Calendar
                    </Button>
                }
            />

            {/* Calendar placeholder */}
            <Card className="border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#1a1a1a]/40 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>December 2025</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-white/20 bg-white/5">
                        <div className="text-center">
                            <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-4 text-sm text-muted-foreground">
                                Calendar view placeholder
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Full calendar integration coming soon
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Upcoming interviews */}
            <Card className="border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#1a1a1a]/40 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>
                        Upcoming Interviews ({upcomingInterviews.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {upcomingInterviews.map(interview => (
                        <div
                            key={interview.id}
                            className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div className="flex-1 space-y-1">
                                <h3 className="font-medium text-white">
                                    {interview.candidate}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {interview.position}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <CalendarIcon className="h-4 w-4" />
                                        {interview.date}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        {interview.time} ({interview.duration})
                                    </span>
                                    {interview.type === 'video' && (
                                        <span className="flex items-center gap-1">
                                            <Video className="h-4 w-4" />
                                            Video call
                                        </span>
                                    )}
                                </div>
                            </div>
                            <Button variant="outline" size="sm">
                                Join / Details
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
