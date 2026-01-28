'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createCompany } from '@/actions';
import { useUIStore } from '@/stores/ui.store';
import { Building2, Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

const companySetupSchema = z.object({
    name: z.string().min(2, 'Company name must be at least 2 characters'),
    industry: z.string().min(2, 'Industry is required'),
    tagline: z.string().optional(),
    description: z.string().optional(),
    website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    companySize: z.string().optional(),
});

type CompanySetupFormValues = z.infer<typeof companySetupSchema>;

export default function CompanySetupPage() {
    const router = useRouter();
    const { addNotification } = useUIStore();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<CompanySetupFormValues>({
        resolver: zodResolver(companySetupSchema),
        defaultValues: {
            name: '',
            industry: '',
            tagline: '',
            description: '',
            website: '',
            companySize: '',
        },
    });

    const onSubmit = async (data: CompanySetupFormValues) => {
        setIsLoading(true);
        try {
            const result = await createCompany(data);

            if (result.success) {
                addNotification({
                    type: 'success',
                    message: 'Company profile created successfully!',
                });
                router.push('/dashboard');
            } else {
                addNotification({
                    type: 'error',
                    message: result.error || 'Failed to create company profile',
                });
            }
        } catch {
            addNotification({
                type: 'error',
                message: 'An unexpected error occurred',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-slate-950 to-slate-900">
            <Card className="w-full max-w-2xl">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Building2 className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-bold">
                        Create Your Company Profile
                    </CardTitle>
                    <CardDescription>
                        Let&apos;s set up your company profile to get started
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Company Name *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Tech Innovations Inc."
                                                disabled={isLoading}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="industry"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Industry *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Technology, Healthcare, Finance..."
                                                disabled={isLoading}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="tagline"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Company Tagline</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Building the future of work"
                                                disabled={isLoading}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Tell us about your company..."
                                                className="min-h-[100px]"
                                                disabled={isLoading}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="website"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Website</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="https://yourcompany.com"
                                                disabled={isLoading}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="companySize"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Company Size</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="1-10, 11-50, 51-200, 201-500..."
                                                disabled={isLoading}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => router.push('/')}
                                    disabled={isLoading}
                                >
                                    Skip for now
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={isLoading}
                                >
                                    {isLoading && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Create Company Profile
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
