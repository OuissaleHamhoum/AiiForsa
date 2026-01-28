/**
 * Centralized API Client
 * Handles authentication, base URL, and common request logic
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiRequestOptions extends RequestInit {
    authenticated?: boolean;
    params?: Record<string, string>;
}

/**
 * Get JWT token from cookies (client-side)
 */
function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;

    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(c => c.trim().startsWith('access_token='));

    if (!tokenCookie) return null;

    return tokenCookie.split('=')[1];
}

/**
 * Get JWT token from cookies (server-side)
 * @param cookieHeader - The Cookie header from the request
 */
export function getAccessTokenServer(cookieHeader?: string): string | null {
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(';');
    const tokenCookie = cookies.find(c => c.trim().startsWith('access_token='));

    if (!tokenCookie) return null;

    return tokenCookie.split('=')[1];
}

/**
 * Make an authenticated API request
 */
export async function apiRequest<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {},
): Promise<T> {
    const { authenticated = true, params, ...fetchOptions } = options;

    // Build URL with query params
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
    }

    // Build headers
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(fetchOptions.headers as Record<string, string>),
    };

    // Add authentication if required
    if (authenticated) {
        const token = getAccessToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    const response = await fetch(url.toString(), {
        ...fetchOptions,
        headers,
    });

    if (!response.ok) {
        const error = await response
            .json()
            .catch(() => ({ message: response.statusText }));
        throw new Error(error.message || `API Error: ${response.status}`);
    }

    return response.json();
}

/**
 * Upload file with multipart/form-data
 */
export async function uploadFile<T = any>(
    endpoint: string,
    file: File,
    additionalFields?: Record<string, string>,
): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalFields) {
        Object.entries(additionalFields).forEach(([key, value]) => {
            formData.append(key, value);
        });
    }

    const token = getAccessToken();
    const headers: HeadersInit = {};

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
    });

    if (!response.ok) {
        const error = await response
            .json()
            .catch(() => ({ message: response.statusText }));
        throw new Error(error.message || `Upload Error: ${response.status}`);
    }

    return response.json();
}

/**
 * API helper methods
 */
export const api = {
    get: <T = any>(endpoint: string, options?: ApiRequestOptions) =>
        apiRequest<T>(endpoint, { ...options, method: 'GET' }),

    post: <T = any>(
        endpoint: string,
        data?: any,
        options?: ApiRequestOptions,
    ) =>
        apiRequest<T>(endpoint, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        }),

    patch: <T = any>(
        endpoint: string,
        data?: any,
        options?: ApiRequestOptions,
    ) =>
        apiRequest<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        }),

    put: <T = any>(endpoint: string, data?: any, options?: ApiRequestOptions) =>
        apiRequest<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        }),

    delete: <T = any>(endpoint: string, options?: ApiRequestOptions) =>
        apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),

    upload: uploadFile,
};

/**
 * User API endpoints
 */
export const userApi = {
    // TODO: Update endpoint based on actual backend implementation
    getCurrentUser: () => api.get('/api/v1/users/me'),

    updateUser: (userId: string, data: any) =>
        api.patch(`/api/v1/users/${userId}`, data),

    // TODO: Backend must implement these endpoints
    uploadAvatar: (userId: string, file: File) =>
        uploadFile(`/api/v1/users/${userId}/avatar`, file),

    uploadCover: (userId: string, file: File) =>
        uploadFile(`/api/v1/users/${userId}/cover`, file),
};

/**
 * Generic CRUD operations for related resources
 */
export const createRelationApi = (resource: string) => ({
    list: (userId: string) => api.get(`/api/v1/users/${userId}/${resource}`),
    get: (id: string) => api.get(`/api/v1/${resource}/${id}`),
    create: (data: any) => api.post(`/api/v1/${resource}`, data),
    update: (id: string, data: any) =>
        api.patch(`/api/v1/${resource}/${id}`, data),
    delete: (id: string) => api.delete(`/api/v1/${resource}/${id}`),
});
