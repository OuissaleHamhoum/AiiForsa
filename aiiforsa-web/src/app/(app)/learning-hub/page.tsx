'use client';
import { useEffect, useMemo, useState } from 'react';
import Loader from '../../../components/learning-hub/Loader';
import ResourceCard from '../../../components/learning-hub/ResourceCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from '@/components/ui/card';
import { BookOpen, Video, FileText, Award, Folder } from 'lucide-react';
import type { LearningResource } from '../../../types/learning-resource';

const TAB_MAP = [
    { label: 'Courses', key: 'courses', icon: BookOpen },
    { label: 'Videos', key: 'videos', icon: Video },
    { label: 'Blogs', key: 'blogs', icon: FileText },
    { label: 'Certifications', key: 'certifications', icon: Award },
    { label: 'Projects', key: 'projects', icon: Folder },
];

export default function LearningHubPage() {
    const [active, setActive] = useState('courses');
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<LearningResource[]>([]);
    const [query, setQuery] = useState('');
    const [bookmarks, setBookmarks] = useState<string[]>(() => {
        try {
            return JSON.parse(localStorage.getItem('lh_bookmarks') || '[]');
        } catch {
            return [];
        }
    });

    useEffect(() => {
        fetchFor(active);
    }, [active]);

    async function fetchFor(category: string) {
        setLoading(true);
        try {
            const res = await fetch(`/api/resources/${category}`);
            const data = await res.json();
            setItems(data.items || []);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    }

    function toggleBookmark(id: string) {
        const next = bookmarks.includes(id)
            ? bookmarks.filter(x => x !== id)
            : [...bookmarks, id];
        setBookmarks(next);
        localStorage.setItem('lh_bookmarks', JSON.stringify(next));
    }

    const filtered = useMemo(() => {
        if (!query) return items;
        const q = query.toLowerCase();
        return items.filter(
            i =>
                (i.title || '').toLowerCase().includes(q) ||
                (i.tags || []).some(t => t.toLowerCase().includes(q)),
        );
    }, [items, query]);

    return (
        <div className="py-8 space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    Learning Resource Hub
                </h1>
                <p className="text-muted-foreground">
                    Discover courses, videos, blogs, certifications and projects
                    to advance your career.
                </p>
            </div>

            {/* Tabs */}
            <Tabs value={active} onValueChange={setActive} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                    {TAB_MAP.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <TabsTrigger
                                key={tab.key}
                                value={tab.key}
                                className="gap-2"
                            >
                                <Icon className="size-4" />
                                {tab.label}
                            </TabsTrigger>
                        );
                    })}
                </TabsList>

                {TAB_MAP.map(tab => (
                    <TabsContent
                        key={tab.key}
                        value={tab.key}
                        className="space-y-6 mt-6"
                    >
                        {/* Search Bar */}
                        <div className="flex gap-3 items-center">
                            <Input
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Search resources or tags..."
                                className="flex-1"
                            />
                            <Badge variant="secondary" className="px-3 py-1.5">
                                {filtered.length} items
                            </Badge>
                        </div>

                        {/* Content */}
                        <div>
                            {loading ? (
                                <Loader />
                            ) : (
                                <div className="grid gap-4">
                                    {filtered.map(it => (
                                        <ResourceCard
                                            key={it.id}
                                            resource={it}
                                            bookmarked={bookmarks.includes(
                                                it.id,
                                            )}
                                            onToggleBookmark={toggleBookmark}
                                        />
                                    ))}
                                    {filtered.length === 0 && (
                                        <Card className="border-dashed">
                                            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                                <div className="rounded-full bg-muted p-3 mb-4">
                                                    <tab.icon className="size-6 text-muted-foreground" />
                                                </div>
                                                <CardTitle className="text-lg mb-2">
                                                    No results found
                                                </CardTitle>
                                                <CardDescription>
                                                    Try adjusting your search or
                                                    explore other categories
                                                </CardDescription>
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            )}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
