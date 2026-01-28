'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import * as React from 'react';

export interface NewPostInput {
    caption: string;
    imageUrl?: string;
}

export interface PostComposerProps {
    currentUser: {
        name: string;
        username: string;
        avatarUrl?: string;
    };
    onSubmit: (post: NewPostInput) => void;
}

export function PostComposer({ currentUser, onSubmit }: PostComposerProps) {
    const [caption, setCaption] = React.useState('');
    const [imageUrl, setImageUrl] = React.useState<string>('');

    const initials = React.useMemo(() => {
        const parts = currentUser.name.split(' ');
        return parts
            .map(p => p[0]?.toUpperCase() ?? '')
            .slice(0, 2)
            .join('');
    }, [currentUser.name]);

    const canPost = caption.trim().length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canPost) return;

        try {
            onSubmit({
                caption: caption.trim(),
                imageUrl: imageUrl || undefined,
            });
            setCaption('');
            setImageUrl('');
        } catch {
            // Handle error silently for now
        }
    };

    return (
        <Card className="rounded-2xl p-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage
                            src={currentUser.avatarUrl}
                            alt={`${currentUser.name} avatar`}
                        />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <Textarea
                        aria-label="Write a post"
                        value={caption}
                        onChange={e => setCaption(e.target.value)}
                        placeholder="What's happening?"
                        className="min-h-[70px] flex-1 bg-white/5 text-white border-white/10 placeholder:text-white/40"
                    />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Input
                        aria-label="Image URL (optional)"
                        placeholder="Paste an image URL (optional)"
                        value={imageUrl}
                        onChange={e => setImageUrl(e.target.value)}
                        className="bg-white/5 text-white border-white/10 placeholder:text-white/40"
                    />
                    <div className="flex-1" />
                    <Button
                        type="submit"
                        disabled={!canPost}
                        className="self-end bg-[#e67320] text-[#0a0a0a] hover:bg-[#cf6318]"
                        aria-label="Publish post"
                    >
                        Post
                    </Button>
                </div>
            </form>
        </Card>
    );
}

export default PostComposer;
