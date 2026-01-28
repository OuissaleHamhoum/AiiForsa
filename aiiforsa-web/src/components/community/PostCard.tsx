'use client';

import {
    addComment,
    getComments,
    toggleLike,
} from '@/actions/community-actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useRelativeTime } from '@/hooks/useRelativeTime';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import LikeCommentBar from './LikeCommentBar';

export interface PostComment {
    id: string;
    authorName: string;
    text: string;
}

export interface PostAuthor {
    name: string;
    username: string;
    avatarUrl?: string;
}

export interface PostData {
    id: string;
    author: PostAuthor;
    caption: string;
    imageUrl?: string;
    likesCount: number;
    comments: PostComment[];
    createdAt: string | Date;
    likedByCurrentUser?: boolean;
}

export interface PostCardProps {
    post: PostData;
    onUpdate: (post: PostData) => void;
}

export function PostCard({ post, onUpdate }: PostCardProps) {
    const [liked, setLiked] = React.useState(post.likedByCurrentUser || false);
    const [showComments, setShowComments] = React.useState(false);
    const [newComment, setNewComment] = React.useState('');
    const [comments, setComments] = React.useState<PostComment[]>([]);
    const [commentsLoaded, setCommentsLoaded] = React.useState(false);
    const relative = useRelativeTime(post.createdAt);

    // Fetch comments when showComments becomes true
    React.useEffect(() => {
        if (showComments && !commentsLoaded) {
            const fetchComments = async () => {
                try {
                    const result = await getComments(post.id, 1, 20);
                    if (result) {
                        setComments(
                            result.comments.map(comment => ({
                                id: comment.id,
                                authorName: comment.author.name,
                                text: comment.text,
                            })),
                        );
                        setCommentsLoaded(true);
                    }
                } catch {
                    // Handle error silently
                }
            };
            fetchComments();
        }
    }, [showComments, commentsLoaded, post.id]);

    const initials = React.useMemo(() => {
        const parts = post.author.name.split(' ');
        return parts
            .map(p => p[0]?.toUpperCase() ?? '')
            .slice(0, 2)
            .join('');
    }, [post.author.name]);

    const handleToggleLike = async () => {
        try {
            const result = await toggleLike(post.id);
            if (result) {
                // Update local state based on API response
                const delta = result.liked ? 1 : -1;
                const updated = {
                    ...post,
                    likesCount: post.likesCount + delta,
                };
                setLiked(result.liked);
                onUpdate(updated);
            }
        } catch {
            // Handle error silently for now
        }
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const result = await addComment(post.id, newComment.trim());
            if (result) {
                // Add the comment locally to the comments state
                setComments(prev => [
                    ...prev,
                    {
                        id: `${post.id}-c-${Date.now()}`,
                        authorName: 'You', // This should come from auth context
                        text: newComment.trim(),
                    },
                ]);
                setNewComment('');
            }
        } catch {
            // Handle error silently for now
        }
    };

    return (
        <Card className="rounded-2xl p-5 flex flex-col gap-4">
            <div className="flex items-start gap-3">
                <Avatar className="h-11 w-11">
                    <AvatarImage
                        src={post.author.avatarUrl}
                        alt={`${post.author.name} avatar`}
                    />
                    <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Link
                            href={`/profile/${post.author.username}`}
                            aria-label={`Go to ${post.author.name}'s profile`}
                            className="font-semibold text-white hover:underline truncate"
                        >
                            {post.author.name}
                        </Link>
                        <span className="text-xs text-white/60">
                            @{post.author.username}
                        </span>
                        <span className="text-xs text-white/60">
                            • {relative}
                        </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed whitespace-pre-wrap text-white/90">
                        {post.caption}
                    </p>
                    {post.imageUrl ? (
                        <div className="mt-3 overflow-hidden rounded-xl ring-1 ring-white/10">
                            <Image
                                src={post.imageUrl}
                                alt={post.caption.slice(0, 40) || 'post image'}
                                width={800}
                                height={500}
                                className="h-auto w-full object-cover"
                            />
                        </div>
                    ) : null}
                </div>
            </div>
            <LikeCommentBar
                liked={liked}
                likesCount={post.likesCount}
                onToggleLike={handleToggleLike}
                onToggleComments={() => setShowComments(!showComments)}
            />
            {showComments && (
                <div className="mt-2 space-y-3">
                    <Separator className="bg-white/10" />
                    <ul className="space-y-2">
                        {comments.map(c => (
                            <li key={c.id} className="text-sm text-white/60">
                                <span className="font-medium text-white">
                                    {c.authorName}:
                                </span>{' '}
                                {c.text}
                            </li>
                        ))}
                    </ul>
                    <form
                        onSubmit={handleAddComment}
                        className="flex items-center gap-2"
                    >
                        <Input
                            aria-label="Add a comment"
                            placeholder="Add a comment"
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            className="flex-1 bg-white/5 text-white border-white/10 placeholder:text-white/40"
                        />
                        <button
                            type="submit"
                            aria-label="Submit comment"
                            className="rounded-full bg-[#e67320] px-4 py-1.5 text-xs font-semibold text-[#0a0a0a] hover:bg-[#cf6318] transition-colors disabled:opacity-50"
                            disabled={!newComment.trim()}
                        >
                            Post
                        </button>
                    </form>
                </div>
            )}
        </Card>
    );
}

export default PostCard;
