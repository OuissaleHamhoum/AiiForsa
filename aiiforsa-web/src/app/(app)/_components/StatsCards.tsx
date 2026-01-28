import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Calendar, Gift } from 'lucide-react';

interface StatsCardsProps {
    stats: {
        totalApplications: number;
        interviewsScheduled: number;
        offersReceived: number;
    };
}

export function StatsCards({ stats }: StatsCardsProps) {
    return (
        <div className="grid gap-6 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white/70">
                        Total Applications
                    </CardTitle>
                    <Briefcase className="h-4 w-4 text-[#cf6318]" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">
                        {stats.totalApplications}
                    </div>
                    <p className="text-xs text-white/60">
                        +12% from last month
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white/70">
                        Interviews Scheduled
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-[#cf6318]" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">
                        {stats.interviewsScheduled}
                    </div>
                    <p className="text-xs text-white/60">Next one tomorrow</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white/70">
                        Offers Received
                    </CardTitle>
                    <Gift className="h-4 w-4 text-[#cf6318]" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">
                        {stats.offersReceived}
                    </div>
                    <p className="text-xs text-white/60">Keep it up!</p>
                </CardContent>
            </Card>
        </div>
    );
}
