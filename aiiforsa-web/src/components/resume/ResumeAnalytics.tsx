'use client';

import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getResumeShareStats } from '@/actions/resume-actions';
import { BarChart3, Eye, Calendar, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ResumeAnalyticsProps {
    resumeId: string;
}

interface AnalyticsData {
    shareViews: number;
    lastViewedAt?: Date;
    isPublic: boolean;
    shareSlug?: string;
    shareExpiry?: Date;
}

/**
 * Resume Analytics Component
 * Displays sharing statistics and analytics for a resume
 * Shows view counts, last viewed date, share status, and expiry
 */
export function ResumeAnalytics({ resumeId }: ResumeAnalyticsProps) {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadAnalytics();
    }, [resumeId]);

    const loadAnalytics = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await getResumeShareStats(resumeId);

            if (!result.success || !result.data) {
                throw new Error(result.error || 'Failed to load analytics');
            }

            setAnalytics({
                shareViews: result.data.shareViews,
                lastViewedAt: result.data.lastViewedAt
                    ? new Date(result.data.lastViewedAt)
                    : undefined,
                isPublic: result.data.isPublic,
                shareSlug: result.data.shareSlug || undefined,
                shareExpiry: result.data.shareExpiry
                    ? new Date(result.data.shareExpiry)
                    : undefined,
            });
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to load analytics',
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Share Analytics</h3>
                </div>
                <div className="space-y-4 animate-pulse">
                    <div className="h-20 bg-muted rounded" />
                    <div className="h-20 bg-muted rounded" />
                </div>
            </Card>
        );
    }

    if (error || !analytics) {
        return (
            <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Share Analytics</h3>
                </div>
                <div className="text-center py-8">
                    <p className="text-muted-foreground">
                        {error || 'No analytics data available'}
                    </p>
                </div>
            </Card>
        );
    }

    if (!analytics.isPublic || !analytics.shareSlug) {
        return (
            <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="h-5 w-5" />
                    <h3 className="text-lg font-semibold">Share Analytics</h3>
                </div>
                <div className="text-center py-8">
                    <p className="text-muted-foreground">
                        Resume is not currently shared
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Generate a share link to start tracking analytics
                    </p>
                </div>
            </Card>
        );
    }

    const isExpired =
        analytics.shareExpiry && analytics.shareExpiry < new Date();

    return (
        <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Share Analytics</h3>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Total Views */}
                <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">
                                Total Views
                            </p>
                            <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                                {analytics.shareViews}
                            </p>
                        </div>
                        <Eye className="h-8 w-8 text-blue-500 opacity-70" />
                    </div>
                    <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        <span>Since sharing started</span>
                    </div>
                </div>

                {/* Last Viewed */}
                <div className="border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">
                                Last Viewed
                            </p>
                            <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                                {analytics.lastViewedAt ? (
                                    <span>
                                        {new Intl.DateTimeFormat('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        }).format(analytics.lastViewedAt)}
                                    </span>
                                ) : (
                                    <span className="text-base">
                                        Not yet viewed
                                    </span>
                                )}
                            </p>
                        </div>
                        <Calendar className="h-8 w-8 text-purple-500 opacity-70" />
                    </div>
                    {analytics.lastViewedAt && (
                        <div className="mt-3 text-xs text-muted-foreground">
                            {new Intl.DateTimeFormat('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                            }).format(analytics.lastViewedAt)}
                        </div>
                    )}
                </div>
            </div>

            <Separator className="my-6" />

            {/* Share Status */}
            <div className="space-y-3">
                <h4 className="text-sm font-semibold">Share Status</h4>

                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span
                        className={`font-medium ${
                            isExpired
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-green-600 dark:text-green-400'
                        }`}
                    >
                        {isExpired ? 'Expired' : 'Active'}
                    </span>
                </div>

                {analytics.shareExpiry && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Expires</span>
                        <span
                            className={`font-medium ${
                                isExpired
                                    ? 'text-red-600 dark:text-red-400'
                                    : 'text-muted-foreground'
                            }`}
                        >
                            {new Intl.DateTimeFormat('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                            }).format(analytics.shareExpiry)}
                        </span>
                    </div>
                )}

                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Share Link</span>
                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                        .../{analytics.shareSlug}
                    </span>
                </div>
            </div>

            {/* Insights */}
            {analytics.shareViews > 0 && (
                <>
                    <Separator className="my-6" />
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Insights</h4>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            {analytics.shareViews === 1 && (
                                <p>🎉 Your resume has been viewed once!</p>
                            )}
                            {analytics.shareViews > 1 &&
                                analytics.shareViews < 10 && (
                                    <p>
                                        📊 Your resume is getting attention with{' '}
                                        {analytics.shareViews} views
                                    </p>
                                )}
                            {analytics.shareViews >= 10 && (
                                <p>
                                    🚀 Great job! Your resume has reached{' '}
                                    {analytics.shareViews} views
                                </p>
                            )}
                            {analytics.lastViewedAt &&
                                Date.now() - analytics.lastViewedAt.getTime() <
                                    24 * 60 * 60 * 1000 && (
                                    <p>✨ Recent activity detected!</p>
                                )}
                        </div>
                    </div>
                </>
            )}
        </Card>
    );
}
