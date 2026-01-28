'use server';

import { auth } from '@/auth';

const API_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Notification types
export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    priority: NotificationPriority;
    title: string;
    message: string;
    actionUrl?: string;
    isRead: boolean;
    readAt?: string;
    isArchived: boolean;
    metadata?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

export type NotificationType =
    | 'SYSTEM'
    | 'ACHIEVEMENT'
    | 'APPLICATION_UPDATE'
    | 'INTERVIEW_REMINDER'
    | 'DEADLINE_REMINDER'
    | 'JOB_RECOMMENDATION'
    | 'MESSAGE';

export type NotificationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

// Helper for authenticated requests
async function authenticatedFetch<T>(
    endpoint: string,
    options: RequestInit = {},
): Promise<{ success: boolean; data?: T; error?: string }> {
    const session = await auth();
    const token = session?.user?.accessToken;

    if (!token) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                ...options.headers,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                success: false,
                error:
                    errorData.message ||
                    `Request failed with status ${response.status}`,
            };
        }

        const responseData = await response.json();
        // API returns { statusCode, message, data }, unwrap the data field
        const data = responseData?.data ?? responseData;
        return { success: true, data };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Request failed',
        };
    }
}

/**
 * Get all notifications for current user
 */
export async function getNotifications(options?: {
    includeRead?: boolean;
    includeArchived?: boolean;
    limit?: number;
}): Promise<{ success: boolean; data?: Notification[]; error?: string }> {
    const params = new URLSearchParams();
    if (options?.includeRead !== undefined) {
        params.set('includeRead', String(options.includeRead));
    }
    if (options?.includeArchived !== undefined) {
        params.set('includeArchived', String(options.includeArchived));
    }
    if (options?.limit !== undefined) {
        params.set('limit', String(options.limit));
    }

    const queryString = params.toString();
    const endpoint = `/notifications${queryString ? `?${queryString}` : ''}`;

    return authenticatedFetch<Notification[]>(endpoint);
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(): Promise<{
    success: boolean;
    data?: { count: number };
    error?: string;
}> {
    return authenticatedFetch<{ count: number }>('/notifications/unread-count');
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(
    notificationId: string,
): Promise<{ success: boolean; data?: Notification; error?: string }> {
    return authenticatedFetch<Notification>(
        `/notifications/${notificationId}/read`,
        { method: 'PATCH' },
    );
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(): Promise<{
    success: boolean;
    error?: string;
}> {
    return authenticatedFetch('/notifications/read-all', { method: 'POST' });
}

/**
 * Archive a notification
 */
export async function archiveNotification(
    notificationId: string,
): Promise<{ success: boolean; data?: Notification; error?: string }> {
    return authenticatedFetch<Notification>(
        `/notifications/${notificationId}/archive`,
        { method: 'PATCH' },
    );
}

/**
 * Delete a notification
 */
export async function deleteNotification(
    notificationId: string,
): Promise<{ success: boolean; error?: string }> {
    return authenticatedFetch(`/notifications/${notificationId}`, {
        method: 'DELETE',
    });
}
