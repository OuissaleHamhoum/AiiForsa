import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';

interface Interview {
    id: string;
    company: string;
    position: string;
    date: Date;
    time: string;
}

interface UpcomingInterviewsProps {
    interviews: Interview[];
}

export function UpcomingInterviews({ interviews }: UpcomingInterviewsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <Calendar className="h-5 w-5 text-[#cf6318]" />
                    Upcoming Interviews
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {interviews.length === 0 ? (
                    <p className="text-white/60 text-center py-8">
                        No upcoming interviews scheduled
                    </p>
                ) : (
                    interviews.map(interview => (
                        <div
                            key={interview.id}
                            className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10"
                        >
                            <div className="flex-shrink-0">
                                <div className="h-12 w-12 rounded-lg bg-[#cf6318]/20 flex items-center justify-center">
                                    <Calendar className="h-6 w-6 text-[#cf6318]" />
                                </div>
                            </div>

                            <div className="flex-1">
                                <h4 className="font-medium text-white">
                                    {interview.position}
                                </h4>
                                <p className="text-sm text-white/60">
                                    {interview.company}
                                </p>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center gap-1 text-sm text-white/60">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                            {interview.date.toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-white/60">
                                        <Clock className="h-4 w-4" />
                                        <span>{interview.time}</span>
                                    </div>
                                </div>
                            </div>

                            <Badge
                                variant="secondary"
                                className="bg-[#cf6318]/20 text-[#cf6318] border-[#cf6318]/30"
                            >
                                Scheduled
                            </Badge>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
