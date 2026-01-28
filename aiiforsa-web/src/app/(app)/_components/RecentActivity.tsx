import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface Activity {
    id: string;
    action: string;
    company: string;
    time: string;
    type: string;
    icon: LucideIcon;
}

interface RecentActivityProps {
    activities: Activity[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <span className="text-blue-400">📈</span>
                    Recent Activity
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {activities.map(activity => {
                        const Icon = activity.icon;

                        return (
                            <div
                                key={activity.id}
                                className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                            >
                                <div className="flex-shrink-0 mt-1">
                                    <div className="h-8 w-8 rounded-lg bg-[#cf6318]/20 flex items-center justify-center">
                                        <Icon className="h-4 w-4 text-[#cf6318]" />
                                    </div>
                                </div>

                                <div className="flex-1 space-y-1">
                                    <p className="text-sm text-white">
                                        {activity.action}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-white/60">
                                            {activity.company}
                                        </span>
                                        <Badge
                                            variant="outline"
                                            className="text-xs border-white/20 text-white/60"
                                        >
                                            {activity.time}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
