/**
 * User interface matching backend user structure
 */
export interface User {
    id: string;
    email: string;
    name: string;
    role: 'USER' | 'BUSINESS' | 'ADMIN';
    companyId?: string | null;
    hasCompanyProfile?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Authentication response from backend
 */
export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

/**
 * API error response structure
 */
export interface ApiError {
    message: string;
    statusCode: number;
    error?: string;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
    email: string;
    password: string;
}

/**
 * Register credentials
 */
export interface RegisterCredentials {
    name: string;
    email: string;
    password: string;
    role?: 'USER' | 'BUSINESS';
}

/**
 * Forgot password request
 */
export interface ForgotPasswordRequest {
    email: string;
}

/**
 * Reset password request
 */
export interface ResetPasswordRequest {
    email: string;
    otp: string;
    newPassword: string;
}

/**
 * Refresh token request
 */
export interface RefreshTokenRequest {
    refreshToken: string;
}

/**
 * Logout request
 */
export interface LogoutRequest {
    userId: string;
}
