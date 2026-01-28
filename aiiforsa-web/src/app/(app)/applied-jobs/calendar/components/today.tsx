'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Interview {
    id: string;
    jobTitle: string;
    company: string;
    date: Date;
    time: string;
}

interface TodayProps {
    selectedDate: Date | undefined;
    interviews: Interview[];
}

export function Today({ selectedDate, interviews }: TodayProps) {
    const formatSelectedDate = (date: Date | undefined) => {
        if (!date) return '';
        // Always return the formatted date (do not return 'Today')
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    return (
        <Card className="border-white/10 bg-[#1a1a1a]/60 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-lg font-normal text-white">
                    Interviews on {formatSelectedDate(selectedDate)}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {interviews.length === 0 ? (
                    <div className="flex items-center justify-center py-12 rounded-lg border border-white/5 bg-white/5">
                        <p className="text-[#90A1B9] text-sm">
                            No interviews scheduled for this date
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {interviews.map(interview => (
                            <Card
                                key={interview.id}
                                className="border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-semibold text-white text-base">
                                                {interview.jobTitle}
                                            </h4>
                                            <p className="text-sm text-[#90A1B9] mt-1">
                                                {interview.company}
                                            </p>
                                        </div>
                                        <Badge className="bg-button-accent/20 text-button-accent border-button-accent/30 hover:bg-button-accent/30">
                                            {interview.time}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
