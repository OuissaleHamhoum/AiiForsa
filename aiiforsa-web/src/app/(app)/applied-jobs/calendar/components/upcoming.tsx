'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Interview {
    id: string;
    jobTitle: string;
    company: string;
    date: Date;
    time: string;
}

interface UpcomingProps {
    interviews: Interview[];
}

export function Upcoming({ interviews }: UpcomingProps) {
    const formatInterviewDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <Card className="border-white/10 bg-[#1a1a1a]/60 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-lg font-normal text-white">
                    All Upcoming Interviews
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {interviews.map(interview => (
                        <Card
                            key={interview.id}
                            className="border-white/10 bg-[#2a2a2a]/40 hover:bg-[#2a2a2a]/60 transition-colors"
                        >
                            <CardContent className="p-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-white text-base">
                                            {interview.jobTitle}
                                        </h4>
                                        <p className="text-sm text-[#90A1B9] mt-1">
                                            {interview.company}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-white">
                                            {formatInterviewDate(
                                                interview.date,
                                            )}
                                        </p>
                                        <p className="text-sm text-[#90A1B9] mt-1">
                                            {interview.time}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
