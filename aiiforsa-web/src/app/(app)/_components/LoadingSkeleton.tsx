import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function LoadingSkeleton() {
    return (
        <div className="min-h-screen px-6 py-8 lg:px-10 h-full">
            <div className="mx-auto max-w-7xl space-y-8 h-full">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2 h-full">
                        <Skeleton className="h-8 w-64 bg-white/10" />
                        <Skeleton className="h-5 w-96 bg-white/5" />
                    </div>
                    <Card className="lg:min-w-[320px]">
                        <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                                <Skeleton className="h-16 w-16 rounded-full bg-white/10" />
                                <div className="flex-1 space-y-3">
                                    <Skeleton className="h-4 w-24 bg-white/10" />
                                    <Skeleton className="h-3 w-32 bg-white/5" />
                                    <Skeleton className="h-2 w-full bg-white/10" />
                                    <div className="flex gap-4">
                                        <Skeleton className="h-4 w-16 bg-white/10" />
                                        <Skeleton className="h-4 w-20 bg-white/10" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <Skeleton className="h-4 w-24 bg-white/10" />
                                    <Skeleton className="h-4 w-4 bg-white/10" />
                                </div>
                                <Skeleton className="h-8 w-16 bg-white/10 mb-2" />
                                <Skeleton className="h-3 w-20 bg-white/5" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardContent className="p-6">
                            <Skeleton className="h-6 w-32 bg-white/10 mb-4" />
                            <div className="space-y-4">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10"
                                    >
                                        <Skeleton className="h-10 w-10 rounded-lg bg-white/10" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-48 bg-white/10" />
                                            <Skeleton className="h-2 w-32 bg-white/5" />
                                            <Skeleton className="h-2 w-full bg-white/10" />
                                        </div>
                                        <Skeleton className="h-6 w-16 bg-white/10" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <Skeleton className="h-6 w-32 bg-white/10 mb-4" />
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="p-4 rounded-lg bg-white/5 border border-white/10"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-10 w-10 rounded-lg bg-white/10" />
                                            <div className="flex-1">
                                                <Skeleton className="h-4 w-20 bg-white/10 mb-2" />
                                                <Skeleton className="h-3 w-16 bg-white/5" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
