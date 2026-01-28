/**
 * Security utilities for input sanitization and validation
 */

/**
 * Sanitize HTML input to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
    // Basic sanitization - replace dangerous characters
    return dirty
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize user input by trimming and removing dangerous characters
 */
export function sanitizeInput(input: string): string {
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove < and >
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+\s*=/gi, ''); // Remove event handlers
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Check password strength
 */
export function checkPasswordStrength(password: string): {
    strength: 'weak' | 'medium' | 'strong';
    score: number;
    feedback: string[];
} {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    else feedback.push('Use at least 12 characters for better security');

    // Complexity checks
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push('Include lowercase letters');

    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push('Include uppercase letters');

    if (/[0-9]/.test(password)) score += 1;
    else feedback.push('Include numbers');

    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    else feedback.push('Include special characters');

    // Determine strength
    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (score >= 5) strength = 'strong';
    else if (score >= 3) strength = 'medium';

    return { strength, score, feedback };
}

/**
 * Generate a random token for CSRF protection
 */
export function generateCsrfToken(): string {
    if (typeof window !== 'undefined' && window.crypto) {
        const array = new Uint8Array(32);
        window.crypto.getRandomValues(array);
        return Array.from(array, byte =>
            byte.toString(16).padStart(2, '0'),
        ).join('');
    }
    // Fallback for environments without crypto
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Rate limiting helper (client-side)
 */
export class RateLimiter {
    private attempts: Map<string, number[]> = new Map();

    constructor(
        private maxAttempts: number = 5,
        private windowMs: number = 15 * 60 * 1000, // 15 minutes
    ) {}

    /**
     * Check if an action is rate limited
     */
    isRateLimited(identifier: string): boolean {
        const now = Date.now();
        const attempts = this.attempts.get(identifier) || [];

        // Filter out old attempts
        const recentAttempts = attempts.filter(
            time => now - time < this.windowMs,
        );

        if (recentAttempts.length >= this.maxAttempts) {
            return true;
        }

        // Record new attempt
        recentAttempts.push(now);
        this.attempts.set(identifier, recentAttempts);

        return false;
    }

    /**
     * Reset attempts for an identifier
     */
    reset(identifier: string): void {
        this.attempts.delete(identifier);
    }
}
