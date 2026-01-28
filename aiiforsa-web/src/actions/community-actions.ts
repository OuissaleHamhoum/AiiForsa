'use server';

import { handleRequest } from '@/lib/server-request';
import { revalidatePath } from 'next/cache';

export interface Post {
    id: string;
    caption: string;
    imageUrl?: string;
    createdAt: string;
    author: {
        id: string;
        name: string;
        profileImage?: string;
        headline?: string;
    };
    likesCount: number;
    commentsCount: number;
    likedByCurrentUser: boolean;
}

export interface PostsResponse {
    posts: Post[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface Comment {
    id: string;
    text: string;
    createdAt: string;
    author: {
        id: string;
        name: string;
        profileImage?: string;
    };
}

export interface CommentsResponse {
    comments: Comment[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export async function getPosts(
    page: number = 1,
    limit: number = 10,
): Promise<PostsResponse | null> {
    const result = await handleRequest<PostsResponse>(
        'GET',
        `/community/posts?page=${page}&limit=${limit}`,
        undefined,
        true,
    );

    if (result.error) {
        return null;
    }

    return result.data || null;
}

export async function createPost(caption: string, imageUrl?: string) {
    const result = await handleRequest(
        'POST',
        '/community/posts',
        { caption, imageUrl },
        true,
    );

    if (result.error) {
        return null;
    }

    if (result.data) {
        revalidatePath('/community');
        return result.data;
    }

    return null;
}

export async function getPost(postId: string) {
    const result = await handleRequest<Post>(
        'GET',
        `/community/posts/${postId}`,
        undefined,
        true,
    );

    if (result.error) {
        return null;
    }

    return result.data || null;
}

export async function updatePost(
    postId: string,
    updates: { caption?: string; imageUrl?: string },
) {
    const result = await handleRequest(
        'PUT',
        `/community/posts/${postId}`,
        updates,
        true,
    );

    if (result.error) {
        return null;
    }

    if (result.data) {
        revalidatePath('/community');
        revalidatePath(`/community/posts/${postId}`);
        return result.data;
    }

    return null;
}

export async function deletePost(postId: string) {
    const result = await handleRequest(
        'DELETE',
        `/community/posts/${postId}`,
        undefined,
        true,
    );

    if (result.error) {
        return false;
    }

    if (result.data) {
        revalidatePath('/community');
        return true;
    }

    return false;
}

export async function toggleLike(postId: string) {
    const result = await handleRequest<{ liked: boolean }>(
        'POST',
        `/community/posts/${postId}/like`,
        undefined,
        true,
    );

    if (result.error) {
        return null;
    }

    if (result.data) {
        revalidatePath('/community');
        revalidatePath(`/community/posts/${postId}`);
        return result.data;
    }

    return null;
}

export async function addComment(postId: string, text: string) {
    const result = await handleRequest(
        'POST',
        `/community/posts/${postId}/comments`,
        { text },
        true,
    );

    if (result.error) {
        return null;
    }

    if (result.data) {
        revalidatePath(`/community/posts/${postId}`);
        return result.data;
    }

    return null;
}

export async function getComments(
    postId: string,
    page: number = 1,
    limit: number = 20,
): Promise<CommentsResponse | null> {
    const result = await handleRequest<CommentsResponse>(
        'GET',
        `/community/posts/${postId}/comments?page=${page}&limit=${limit}`,
        undefined,
        true,
    );

    if (result.error) {
        return null;
    }

    return result.data || null;
}

export async function getUserPosts(
    userId: string,
    page: number = 1,
    limit: number = 10,
): Promise<PostsResponse | null> {
    const result = await handleRequest<PostsResponse>(
        'GET',
        `/community/users/${userId}/posts?page=${page}&limit=${limit}`,
        undefined,
        true,
    );

    if (result.error) {
        return null;
    }

    return result.data || null;
}
