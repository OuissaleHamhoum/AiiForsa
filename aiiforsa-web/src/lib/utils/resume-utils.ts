/**
 * Resume Utility Functions
 * Helper functions for resume builder operations
 */

import type { Resume } from '@/types/resume.types';

/**
 * Format date range for display
 */
export function formatDateRange(
    startDate: string,
    endDate?: string,
    current?: boolean,
): string {
    if (current) {
        return `${startDate} - Present`;
    }
    return endDate ? `${startDate} - ${endDate}` : startDate;
}

/**
 * Calculate reading time for content
 */
export function calculateReadingTime(text: string): number {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
}

/**
 * Sanitize HTML content for safe rendering
 */
export function sanitizeHtml(html: string): string {
    // Basic sanitization - in production, use a library like DOMPurify
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
}

/**
 * Generate unique ID for sections/entries
 */
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Estimate content pages based on character count
 */
export function estimatePages(resume: Resume): number {
    const charsPerPage = 3000; // Approximate characters per A4 page
    let totalChars = 0;

    resume.sections.forEach(section => {
        // Count characters in all section content
        totalChars += JSON.stringify(section.data).length;
    });

    return Math.max(1, Math.ceil(totalChars / charsPerPage));
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number format (international)
 */
export function isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phone.length >= 10 && phoneRegex.test(phone);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if content overflows a container
 */
export function checkContentOverflow(elementId: string): boolean {
    const element = document.getElementById(elementId);
    if (!element) return false;
    return element.scrollHeight > element.clientHeight;
}

/**
 * Convert resume to plain text for export
 */
export function resumeToPlainText(resume: Resume): string {
    let text = '';

    resume.sections.forEach(section => {
        if (section.type === 'profile') {
            text += `${section.data.name}\n`;
            if (section.data.professionalTitle) {
                text += `${section.data.professionalTitle}\n`;
            }
            text += `${section.data.email} | ${section.data.phone}\n`;
            if (section.data.location) {
                text += `${section.data.location}\n`;
            }
            text += '\n';
            if (section.data.summary) {
                text += `${section.data.summary}\n\n`;
            }
        }
        // Add other section types as needed
    });

    return text;
}
