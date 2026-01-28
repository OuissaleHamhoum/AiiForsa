// Community Page (integrated with backend API)
// TODO: replace static posts with API call to /api/community/posts

'use client';

import { createPost, getPosts, Post } from '@/actions/community-actions';
import CommunityLayout from '@/components/community/CommunityLayout';
import PostCard, { PostData } from '@/components/community/PostCard';
import PostComposer, {
    NewPostInput,
} from '@/components/community/PostComposer';
import SidebarProfileCard from '@/components/community/SidebarProfileCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import * as React from 'react';

type Author = PostData['author'];

const CURRENT_USER: Author = {
    name: 'AiiForsa Member',
    username: 'aiiforsa',
    avatarUrl: 'https://avatars.githubusercontent.com/u/9919?s=200&v=4',
};

// Transform API Post to PostData format for compatibility with existing components
function transformPostToPostData(post: Post): PostData {
    return {
        id: post.id,
        author: {
            name: post.author.name,
            username: post.author.id, // Using id as username since API doesn't provide username
            avatarUrl: post.author.profileImage,
        },
        caption: post.caption,
        imageUrl: post.imageUrl,
        likesCount: post.likesCount,
        comments: [], // Comments will be loaded separately when needed
        createdAt: post.createdAt,
        likedByCurrentUser: post.likedByCurrentUser,
    };
}

export default function CommunityPage() {
    const [posts, setPosts] = React.useState<PostData[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_loading, setLoading] = React.useState(true);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_error, setError] = React.useState<string | null>(null);

    // Load posts on component mount
    React.useEffect(() => {
        const loadPosts = async () => {
            try {
                setLoading(true);
                const result = await getPosts(1, 10);
                if (result) {
                    const transformedPosts = result.posts.map(
                        transformPostToPostData,
                    );
                    setPosts(transformedPosts);
                }
            } catch {
                setError('Failed to load posts');
            } finally {
                setLoading(false);
            }
        };
        loadPosts();
    }, []);

    const handleCreatePost = React.useCallback(async (data: NewPostInput) => {
        try {
            await createPost(data.caption, data.imageUrl);
            // revalidatePath('/community') in createPost server action will handle UI update
        } catch {
            // Handle error silently for now
        }
    }, []);

    const handleUpdatePost = React.useCallback(
        async (updatedPost: PostData) => {
            // For now, just update local state
            setPosts(prev =>
                prev.map(p => (p.id === updatedPost.id ? updatedPost : p)),
            );
        },
        [],
    );

    return (
        <CommunityLayout
            left={
                <div className="space-y-4">
                    <SidebarProfileCard
                        user={{
                            ...CURRENT_USER,
                            bio: 'Software engineer. Helping AiiForsa grow the dev community.',
                        }}
                    />
                    <Card className="rounded-2xl">
                        <CardHeader>
                            <CardTitle className="text-white">Trends</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm text-white/60">
                                <li className="hover:text-[#e67320] cursor-pointer transition-colors">
                                    #NextJS15
                                </li>
                                <li className="hover:text-[#e67320] cursor-pointer transition-colors">
                                    #TypeScript
                                </li>
                                <li className="hover:text-[#e67320] cursor-pointer transition-colors">
                                    #AIJobs
                                </li>
                                <li className="hover:text-[#e67320] cursor-pointer transition-colors">
                                    #DesignSystems
                                </li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            }
            center={
                <div
                    className="rounded-2xl border border-white/10 p-3"
                    role="region"
                    aria-label="Community feed"
                >
                    <div className="flex flex-col gap-4">
                        <PostComposer
                            currentUser={CURRENT_USER}
                            onSubmit={handleCreatePost}
                        />
                        <ul className="flex flex-col gap-3">
                            {posts.map(p => (
                                <li key={p.id}>
                                    <PostCard
                                        post={p}
                                        onUpdate={handleUpdatePost}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            }
        />
    );
}
