'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MessageSquare, ThumbsUp } from 'lucide-react';

export interface LikeCommentBarProps {
    liked: boolean;
    likesCount: number;
    onToggleLike: () => void;
    onToggleComments: () => void;
}

export function LikeCommentBar({
    liked,
    likesCount,
    onToggleLike,
    onToggleComments,
}: LikeCommentBarProps) {
    return (
        <div className="flex items-center gap-2">
            <Button
                variant={liked ? 'default' : 'secondary'}
                className={cn(
                    'h-8 rounded-full px-3 text-xs',
                    liked
                        ? 'bg-[#e67320] text-[#0a0a0a] hover:bg-[#cf6318]'
                        : 'bg-white/5 text-white/80 hover:bg-white/10',
                )}
                aria-pressed={liked}
                aria-label={liked ? 'Unlike post' : 'Like post'}
                onClick={onToggleLike}
            >
                <ThumbsUp className="mr-1 h-4 w-4" /> {likesCount}
            </Button>
            <Button
                variant="secondary"
                className="h-8 rounded-full px-3 text-xs bg-white/5 text-white/80 hover:bg-white/10"
                aria-label="Toggle comments"
                onClick={onToggleComments}
            >
                <MessageSquare className="mr-1 h-4 w-4" /> Comment
            </Button>
        </div>
    );
}

export default LikeCommentBar;
