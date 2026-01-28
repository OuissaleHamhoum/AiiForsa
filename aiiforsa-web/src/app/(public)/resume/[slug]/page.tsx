import { getSharedResume } from '@/actions/resume-actions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Globe, Mail, MapPin, Phone, Printer } from 'lucide-react';
import { notFound } from 'next/navigation';

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

/**
 * Public Resume Viewer Page
 * Displays shared resume without authentication
 * Accessible via /resume/[slug] route
 */
export default async function PublicResumePage({ params }: PageProps) {
    const { slug } = await params;

    // Fetch shared resume
    const result = await getSharedResume(slug);

    if (!result.success || !result.data) {
        notFound();
    }

    const resume = result.data;
    // Extract profile data from sections
    const profileSection = resume.sections?.find(
        section => section.type === 'profile',
    );
    const profileData = (profileSection as any)?.data || {};

    // Handle print
    const handlePrint = () => {
        if (typeof window !== 'undefined') {
            window.print();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b print:hidden">
                <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Shared Resume</h1>
                        <p className="text-sm text-muted-foreground">
                            View-only access
                        </p>
                    </div>
                    <Button
                        onClick={handlePrint}
                        variant="outline"
                        className="gap-2"
                    >
                        <Printer className="h-4 w-4" />
                        Print
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 py-8 print:py-0">
                <Card className="overflow-hidden print:shadow-none print:border-0">
                    {/* Personal Information Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 print:bg-gradient-to-r print:from-blue-600 print:to-purple-600">
                        <h1 className="text-4xl font-bold mb-2">
                            {profileData?.name || 'N/A'}
                        </h1>
                        <p className="text-xl opacity-90">
                            {profileData?.professionalTitle ||
                                profileData?.headline ||
                                'Professional'}
                        </p>

                        {/* Contact Information */}
                        <div className="flex flex-wrap gap-4 text-sm">
                            {profileData?.email && (
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    {profileData.email}
                                </div>
                            )}
                            {profileData?.phone && (
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    {profileData.phone}
                                </div>
                            )}
                            {profileData?.location && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    {profileData.location}
                                </div>
                            )}
                            {profileData?.website && (
                                <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4" />
                                    {profileData.website}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* Resume content sections - TODO: Implement with resume sections data structure */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">
                                Resume Content
                            </h2>
                            <p className="text-muted-foreground">
                                Resume content will be displayed here once the
                                data structure is fully implemented.
                            </p>
                        </section>
                    </div>
                </Card>

                {/* Footer */}
                <div className="text-center mt-8 text-sm text-muted-foreground print:hidden">
                    <p>
                        This resume was shared via{' '}
                        <span className="font-semibold">AI4SA Platform</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

// Metadata for SEO
export async function generateMetadata({ params }: PageProps) {
    const { slug } = params;
    const result = await getSharedResume(slug);

    if (!result.success || !result.data) {
        return {
            title: 'Resume Not Found',
        };
    }

    const resume = result.data;
    const profileSection = resume.sections?.find(
        section => section.type === 'profile',
    );
    const profileData = (profileSection as any)?.data || {};
    const name = profileData?.name || 'Professional';

    return {
        title: `${name} - Resume`,
        description: `View ${name}'s professional resume`,
    };
}
