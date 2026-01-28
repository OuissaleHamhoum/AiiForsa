import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bookmark, Clock, ExternalLink } from 'lucide-react';
import type { LearningResource } from '../../types/learning-resource';

type Props = {
    resource: LearningResource;
    bookmarked: boolean;
    onToggleBookmark: (id: string) => void;
};

export default function ResourceCard({
    resource,
    bookmarked,
    onToggleBookmark,
}: Props) {
    return (
        <Card className="overflow-hidden">
            <CardContent className="p-4">
                <div className="flex gap-4">
                    {/* Thumbnail */}
                    {resource.thumbnail ? (
                        <div className="flex-shrink-0">
                            <Image
                                src={resource.thumbnail}
                                alt={resource.title}
                                width={96}
                                height={96}
                                className="w-24 h-24 object-cover rounded-md"
                            />
                        </div>
                    ) : (
                        <div className="flex-shrink-0 w-24 h-24 bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground font-medium">
                            {resource.source}
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1 min-w-0">
                                <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-semibold hover:text-primary transition-colors inline-flex items-center gap-1.5 group"
                                >
                                    <span className="line-clamp-1">
                                        {resource.title}
                                    </span>
                                    <ExternalLink className="size-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                    <span>{resource.source}</span>
                                    {resource.duration && (
                                        <>
                                            <span>•</span>
                                            <span className="inline-flex items-center gap-1">
                                                <Clock className="size-3" />
                                                {resource.duration}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Bookmark Button */}
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={
                                    bookmarked ? 'Unbookmark' : 'Bookmark'
                                }
                                onClick={() => onToggleBookmark(resource.id)}
                                className={
                                    bookmarked
                                        ? 'text-yellow-500 hover:text-yellow-600'
                                        : 'text-muted-foreground'
                                }
                            >
                                <Bookmark
                                    className={`size-4 ${bookmarked ? 'fill-current' : ''}`}
                                />
                            </Button>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {resource.description}
                        </p>

                        {/* Tags */}
                        {resource.tags && resource.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {resource.tags.slice(0, 5).map(tag => (
                                    <Badge
                                        key={tag}
                                        variant="secondary"
                                        className="text-xs"
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
