'use client';

import { PageTitle } from '@/components/business/PageTitle';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Briefcase,
    Calendar,
    FileText,
    Plus,
    TrendingUp,
    Users,
} from 'lucide-react';
import Link from 'next/link';

export default function BusinessDashboard() {
    const stats = [
        {
            label: 'Open Positions',
            value: '12',
            change: '+2 this week',
            icon: Briefcase,
            color: 'text-blue-400',
        },
        {
            label: 'New Applications',
            value: '48',
            change: '+12 today',
            icon: FileText,
            color: 'text-green-400',
        },
        {
            label: 'Interviews Scheduled',
            value: '8',
            change: '3 this week',
            icon: Calendar,
            color: 'text-yellow-400',
        },
        {
            label: 'Active Candidates',
            value: '127',
            change: '+24 this month',
            icon: Users,
            color: 'text-purple-400',
        },
    ];

    const quickActions = [
        {
            label: 'Post New Job',
            href: '/business/jobs',
            icon: Plus,
            description: 'Create a new job listing',
        },
        {
            label: 'Review Applications',
            href: '/business/applications',
            icon: FileText,
            description: 'View pending applications',
        },
        {
            label: 'Schedule Interview',
            href: '/business/agenda',
            icon: Calendar,
            description: 'Manage interview calendar',
        },
        {
            label: 'View Analytics',
            href: '/business/stats',
            icon: TrendingUp,
            description: 'Track hiring metrics',
        },
    ];

    const recentApplications = [
        {
            id: '1',
            candidate: 'Sarah Chen',
            position: 'Senior Developer',
            time: '2h ago',
            status: 'new',
        },
        {
            id: '2',
            candidate: 'Mike Johnson',
            position: 'Product Designer',
            time: '5h ago',
            status: 'reviewed',
        },
        {
            id: '3',
            candidate: 'Emma Davis',
            position: 'Marketing Manager',
            time: '1d ago',
            status: 'interview',
        },
    ];

    return (
        <div className="space-y-6">
            <PageTitle
                title="Welcome back"
                description="Here's what's happening with your hiring pipeline"
            />

            {/* Stats grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card
                            key={index}
                            className="border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#1a1a1a]/40 backdrop-blur-sm"
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-sm text-muted-foreground">
                                            {stat.label}
                                        </p>
                                        <p className="mt-2 text-3xl font-bold text-white">
                                            {stat.value}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {stat.change}
                                        </p>
                                    </div>
                                    <div
                                        className={`rounded-lg bg-white/5 p-3 ${stat.color}`}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Quick actions */}
                <Card className="border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#1a1a1a]/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>
                            Common tasks to manage your hiring
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        {quickActions.map((action, index) => {
                            const Icon = action.icon;
                            return (
                                <Link key={index} href={action.href}>
                                    <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4 transition-all hover:border-[#cf6318]/30 hover:bg-white/10">
                                        <div className="rounded-lg bg-[#cf6318]/20 p-3">
                                            <Icon className="h-5 w-5 text-[#cf6318]" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-white">
                                                {action.label}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {action.description}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* Recent applications */}
                <Card className="border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#1a1a1a]/40 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Recent Applications</CardTitle>
                                <CardDescription>
                                    Latest candidate submissions
                                </CardDescription>
                            </div>
                            <Link href="/business/applications">
                                <Button variant="ghost" size="sm">
                                    View All
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {recentApplications.map(app => (
                            <div
                                key={app.id}
                                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4"
                            >
                                <div className="flex-1">
                                    <p className="font-medium text-white">
                                        {app.candidate}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {app.position}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {app.time}
                                    </p>
                                </div>
                                <Badge
                                    variant={
                                        app.status === 'new'
                                            ? 'default'
                                            : 'secondary'
                                    }
                                >
                                    {app.status}
                                </Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
