'use server';

import { handleRequest } from '@/lib/server-request';
import {
    LoginCredentials,
    RegisterCredentials,
    AuthResponse,
} from '@/types/auth.types';

/**
 * Server action for user login
 * Uses the generic handleRequest function for API calls
 */
export async function loginUser(credentials: LoginCredentials): Promise<{
    success: boolean;
    data?: AuthResponse;
    error?: string;
}> {
    const result = await handleRequest<AuthResponse>(
        'POST',
        '/auth/login',
        credentials,
        false,
    );

    if (result.error) {
        return {
            success: false,
            error: result.error.message,
        };
    }

    return {
        success: true,
        data: result.data,
    };
}

/**
 * Server action for user registration
 */
export async function registerUser(credentials: RegisterCredentials): Promise<{
    success: boolean;
    data?: AuthResponse;
    error?: string;
}> {
    const result = await handleRequest<AuthResponse>(
        'POST',
        '/auth/register',
        credentials,
        false,
    );

    if (result.error) {
        return {
            success: false,
            error: result.error.message,
        };
    }

    return {
        success: true,
        data: result.data,
    };
}

/**
 * Server action for forgot password
 */
export async function forgotPasswordAction(email: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
}> {
    const result = await handleRequest<{ message: string }>(
        'POST',
        '/auth/forgot-password',
        { email },
        false,
    );

    if (result.error) {
        return {
            success: false,
            error: result.error.message,
        };
    }

    return {
        success: true,
        message: result.data?.message || 'Reset email sent successfully',
    };
}

/**
 * Server action for password reset
 */
export async function resetPasswordAction(data: {
    email: string;
    otp: string;
    newPassword: string;
}): Promise<{
    success: boolean;
    message?: string;
    error?: string;
}> {
    const result = await handleRequest<{ message: string }>(
        'POST',
        '/auth/reset-password',
        data,
        false,
    );

    if (result.error) {
        return {
            success: false,
            error: result.error.message,
        };
    }

    return {
        success: true,
        message: result.data?.message || 'Password reset successfully',
    };
}

/**
 * Server action for user logout
 * Requires authentication token
 */
export async function logoutAction(): Promise<{
    success: boolean;
    message?: string;
    error?: string;
}> {
    const result = await handleRequest<{ message: string }>(
        'POST',
        '/auth/logout',
        {},
        true,
    );

    if (result.error) {
        return {
            success: false,
            error: result.error.message,
        };
    }

    return {
        success: true,
        message: result.data?.message || 'Logged out successfully',
    };
}
