'use client';

import { PageTitle } from '@/components/business/PageTitle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { FileText, Search, Filter } from 'lucide-react';
import { useState } from 'react';

export default function ApplicationsPage() {
    const [statusFilter, setStatusFilter] = useState('all');

    const applications = [
        {
            id: '1',
            candidate: 'Sarah Chen',
            email: 'sarah@example.com',
            position: 'Senior Developer',
            appliedDate: '2 days ago',
            status: 'new',
        },
        {
            id: '2',
            candidate: 'Mike Johnson',
            email: 'mike@example.com',
            position: 'Product Designer',
            appliedDate: '3 days ago',
            status: 'reviewing',
        },
        {
            id: '3',
            candidate: 'Emma Davis',
            email: 'emma@example.com',
            position: 'Marketing Manager',
            appliedDate: '5 days ago',
            status: 'interview',
        },
    ];

    return (
        <div className="space-y-6">
            <PageTitle
                title="Manage Applications"
                description="Review and process candidate applications"
            />

            {/* Filters */}
            <Card className="border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#1a1a1a]/40 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search candidates..."
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Select
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                            >
                                <SelectTrigger className="w-[140px]">
                                    <Filter className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Status
                                    </SelectItem>
                                    <SelectItem value="new">New</SelectItem>
                                    <SelectItem value="reviewing">
                                        Reviewing
                                    </SelectItem>
                                    <SelectItem value="interview">
                                        Interview
                                    </SelectItem>
                                    <SelectItem value="rejected">
                                        Rejected
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Applications list */}
            <Card className="border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#1a1a1a]/40 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Applications ({applications.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {applications.length > 0 ? (
                        <div className="space-y-3">
                            {applications.map(app => (
                                <div
                                    key={app.id}
                                    className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4 transition-all hover:border-white/20 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#cf6318] to-[#b55416] text-sm font-semibold text-white">
                                                {app.candidate
                                                    .split(' ')
                                                    .map(n => n[0])
                                                    .join('')}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">
                                                    {app.candidate}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {app.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span>{app.position}</span>
                                            <span>•</span>
                                            <span>{app.appliedDate}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge variant="secondary">
                                            {app.status}
                                        </Badge>
                                        <Button variant="outline" size="sm">
                                            View
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                            <p className="mt-4 text-sm text-muted-foreground">
                                No applications found
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
