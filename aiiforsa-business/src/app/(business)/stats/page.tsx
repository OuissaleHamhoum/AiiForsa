'use client';

import { PageTitle } from '@/components/business/PageTitle';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    TrendingUp,
    Users,
    Eye,
    MousePointerClick,
    BarChart3,
} from 'lucide-react';

export default function StatsPage() {
    const metrics = [
        {
            label: 'Total Views',
            value: '2,847',
            change: '+12.5%',
            trend: 'up',
            icon: Eye,
        },
        {
            label: 'Applications',
            value: '468',
            change: '+8.2%',
            trend: 'up',
            icon: Users,
        },
        {
            label: 'Conversion Rate',
            value: '16.4%',
            change: '+2.1%',
            trend: 'up',
            icon: MousePointerClick,
        },
        {
            label: 'Avg. Time to Hire',
            value: '18 days',
            change: '-3 days',
            trend: 'down',
            icon: TrendingUp,
        },
    ];

    return (
        <div className="space-y-6">
            <PageTitle
                title="Analytics"
                description="Track hiring performance and metrics"
                action={
                    <Select defaultValue="30">
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Time range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Last 7 days</SelectItem>
                            <SelectItem value="30">Last 30 days</SelectItem>
                            <SelectItem value="90">Last 90 days</SelectItem>
                        </SelectContent>
                    </Select>
                }
            />

            {/* Metric cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {metrics.map((metric, index) => {
                    const Icon = metric.icon;
                    return (
                        <Card
                            key={index}
                            className="border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#1a1a1a]/40 backdrop-blur-sm"
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm text-muted-foreground">
                                            {metric.label}
                                        </p>
                                        <p className="mt-2 text-2xl font-bold text-white">
                                            {metric.value}
                                        </p>
                                        <p
                                            className={`mt-1 text-xs ${
                                                metric.trend === 'up'
                                                    ? 'text-green-400'
                                                    : 'text-red-400'
                                            }`}
                                        >
                                            {metric.change} vs last period
                                        </p>
                                    </div>
                                    <div className="rounded-lg bg-white/5 p-2">
                                        <Icon className="h-5 w-5 text-[#cf6318]" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Charts placeholder */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#1a1a1a]/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Application Trends</CardTitle>
                        <CardDescription>
                            Daily application volume over time
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-white/20 bg-white/5">
                            <div className="text-center">
                                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                                <p className="mt-4 text-sm text-muted-foreground">
                                    Chart placeholder
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Application trends visualization
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#1a1a1a]/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Source Breakdown</CardTitle>
                        <CardDescription>
                            Where candidates are coming from
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-white/20 bg-white/5">
                            <div className="text-center">
                                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                                <p className="mt-4 text-sm text-muted-foreground">
                                    Chart placeholder
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Traffic source distribution
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Performance by position */}
            <Card className="border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#1a1a1a]/40 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Performance by Position</CardTitle>
                    <CardDescription>
                        Top performing job listings
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[
                            {
                                position: 'Senior Developer',
                                views: 847,
                                applications: 124,
                            },
                            {
                                position: 'Product Designer',
                                views: 623,
                                applications: 98,
                            },
                            {
                                position: 'Marketing Manager',
                                views: 512,
                                applications: 76,
                            },
                        ].map((item, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
                            >
                                <div className="flex-1">
                                    <p className="font-medium text-white">
                                        {item.position}
                                    </p>
                                    <div className="mt-1 flex gap-4 text-sm text-muted-foreground">
                                        <span>{item.views} views</span>
                                        <span>
                                            {item.applications} applications
                                        </span>
                                    </div>
                                </div>
                                <div className="text-sm font-medium text-green-400">
                                    {(
                                        (item.applications / item.views) *
                                        100
                                    ).toFixed(1)}
                                    %
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
