import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useUIStore } from '@/stores/ui.store';
import type {
    LoginCredentials,
    RegisterCredentials,
    ForgotPasswordRequest,
    ResetPasswordRequest,
} from '@/types/auth.types';
import {
    loginUser,
    registerUser,
    forgotPasswordAction,
    resetPasswordAction,
} from '@/actions/auth-actions';

/**
 * Custom hook for login mutation using server actions
 */
export function useLogin() {
    const router = useRouter();
    const { update: updateSession } = useSession();
    const { addNotification } = useUIStore();

    return useMutation({
        mutationFn: async (credentials: LoginCredentials) => {
            // First try server action
            const result = await loginUser(credentials);

            if (!result.success) {
                throw new Error(result.error);
            }

            // Then handle NextAuth session
            const authResult = await signIn('credentials', {
                email: credentials.email,
                password: credentials.password,
                redirect: false,
            });

            if (authResult?.error) {
                throw new Error(authResult.error);
            }

            // Update session with user data
            await updateSession();

            return result.data;
        },
        onSuccess: () => {
            addNotification({
                type: 'success',
                message: 'Login successful!',
            });
            router.push('/');
        },
        onError: (error: Error) => {
            addNotification({
                type: 'error',
                message: error.message || 'Login failed. Please try again.',
            });
        },
    });
}

/**
 * Custom hook for register mutation
 */
export function useRegister() {
    const router = useRouter();
    const { update: updateSession } = useSession();
    const { addNotification } = useUIStore();

    return useMutation({
        mutationFn: async (credentials: RegisterCredentials) => {
            // First try server action
            const result = await registerUser(credentials);

            if (!result.success) {
                throw new Error(result.error);
            }

            // Then handle NextAuth session
            const authResult = await signIn('credentials', {
                email: credentials.email,
                password: credentials.password,
                redirect: false,
            });

            if (authResult?.error) {
                throw new Error(authResult.error);
            }

            // Update session with user data
            await updateSession();

            return result.data;
        },
        onSuccess: () => {
            addNotification({
                type: 'success',
                message: 'Registration successful! Welcome aboard!',
            });
            router.push('/');
        },
        onError: (error: Error) => {
            addNotification({
                type: 'error',
                message:
                    error.message || 'Registration failed. Please try again.',
            });
        },
    });
}

/**
 * Custom hook for logout mutation
 */
export function useLogout() {
    const router = useRouter();
    const { addNotification } = useUIStore();

    return useMutation({
        mutationFn: async () => {
            await signOut({ redirect: false });
        },
        onSuccess: () => {
            addNotification({
                type: 'success',
                message: 'Logged out successfully',
            });
            router.push('/login');
        },
        onError: () => {
            addNotification({
                type: 'error',
                message: 'Logout failed. Please try again.',
            });
            router.push('/login');
        },
    });
}

/**
 * Custom hook for forgot password mutation
 */
export function useForgotPassword() {
    const { addNotification } = useUIStore();

    return useMutation({
        mutationFn: async (data: ForgotPasswordRequest) => {
            const result = await forgotPasswordAction(data.email);

            if (!result.success) {
                throw new Error(result.error);
            }

            return result;
        },
        onSuccess: () => {
            addNotification({
                type: 'success',
                message: 'Password reset email sent! Check your inbox.',
            });
        },
        onError: (error: Error) => {
            addNotification({
                type: 'error',
                message: error.message || 'Failed to send reset email',
            });
        },
    });
}

/**
 * Custom hook for reset password mutation
 */
export function useResetPassword() {
    const router = useRouter();
    const { addNotification } = useUIStore();

    return useMutation({
        mutationFn: async (data: ResetPasswordRequest) => {
            const result = await resetPasswordAction(data);

            if (!result.success) {
                throw new Error(result.error);
            }

            return result;
        },
        onSuccess: () => {
            addNotification({
                type: 'success',
                message:
                    'Password reset successful! Please login with your new password.',
            });
            router.push('/login');
        },
        onError: (error: Error) => {
            addNotification({
                type: 'error',
                message: error.message || 'Password reset failed',
            });
        },
    });
}

/**
 * Custom hook to get current auth state
 */
export function useAuth() {
    const { data: session, status, update: updateSession } = useSession();

    return {
        user: session?.user,
        isAuthenticated: status === 'authenticated',
        isLoading: status === 'loading',
        updateSession,
    };
}
