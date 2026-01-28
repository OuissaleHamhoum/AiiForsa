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
import {
    Building2,
    Palette,
    Users,
    Bell,
    Shield,
    CreditCard,
    ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
    const settingSections = [
        {
            title: 'Company Branding',
            description: 'Manage your company profile and visual identity',
            icon: Palette,
            href: '/company/branding',
            action: 'Edit branding',
        },
        {
            title: 'Company Information',
            description: 'Update business details and contact information',
            icon: Building2,
            href: '/company/profile',
            action: 'View profile',
        },
        {
            title: 'Team Management',
            description: 'Manage team members and permissions',
            icon: Users,
            href: '#',
            action: 'Manage team',
        },
        {
            title: 'Notifications',
            description: 'Configure email and push notifications',
            icon: Bell,
            href: '#',
            action: 'Configure',
        },
        {
            title: 'Security & Privacy',
            description: 'Password, 2FA, and privacy settings',
            icon: Shield,
            href: '#',
            action: 'Manage security',
        },
        {
            title: 'Billing & Plans',
            description: 'Subscription, invoices, and payment methods',
            icon: CreditCard,
            href: '#',
            action: 'View billing',
        },
    ];

    return (
        <div className="space-y-6">
            <PageTitle
                title="Business Settings"
                description="Manage your organization and preferences"
            />

            <div className="grid gap-4 md:grid-cols-2">
                {settingSections.map((section, index) => {
                    const Icon = section.icon;
                    return (
                        <Card
                            key={index}
                            className="group border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#1a1a1a]/40 backdrop-blur-sm transition-all hover:border-white/20"
                        >
                            <CardHeader>
                                <div className="flex items-start gap-4">
                                    <div className="rounded-lg bg-[#cf6318]/20 p-3">
                                        <Icon className="h-6 w-6 text-[#cf6318]" />
                                    </div>
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">
                                            {section.title}
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            {section.description}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Link href={section.href}>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-between hover:bg-white/5"
                                    >
                                        <span>{section.action}</span>
                                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Quick actions */}
            <Card className="border-white/10 bg-gradient-to-br from-[#1a1a1a]/80 to-[#1a1a1a]/40 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Danger Zone</CardTitle>
                    <CardDescription>
                        Irreversible actions - proceed with caution
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                        <div>
                            <p className="font-medium text-white">
                                Delete Organization
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Permanently delete this organization and all
                                data
                            </p>
                        </div>
                        <Button variant="destructive" size="sm">
                            Delete
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
