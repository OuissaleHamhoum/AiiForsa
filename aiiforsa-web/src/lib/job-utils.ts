/**
 * Utility functions for job applications
 */

import { ApplicationStatus, Job, JobApplication } from '@/types/job.types';

/**
 * Format salary range for display
 */
export function formatSalary(
    salaryMin: number | null,
    salaryMax: number | null,
    currency: string | null = 'USD',
): string {
    if (!salaryMin && !salaryMax) return 'Not specified';

    const currencySymbol = currency === 'USD' ? '$' : currency;
    const formatNumber = (num: number) => {
        if (num >= 1000) {
            return `${Math.round(num / 1000)}k`;
        }
        return num.toString();
    };

    if (salaryMin && salaryMax) {
        return `${currencySymbol}${formatNumber(salaryMin)} - ${currencySymbol}${formatNumber(salaryMax)}`;
    }

    if (salaryMin) {
        return `${currencySymbol}${formatNumber(salaryMin)}+`;
    }

    return `Up to ${currencySymbol}${formatNumber(salaryMax!)}`;
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * Calculate days since application
 */
export function daysSinceApplication(appliedAt: string): number {
    const applied = new Date(appliedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - applied.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

/**
 * Get status badge color classes
 */
export function getStatusColor(status: ApplicationStatus): string {
    const statusConfig = {
        applied: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        interview: 'bg-green-500/10 text-green-500 border-green-500/20',
        'on-hold': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
        rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return statusConfig[status];
}

/**
 * Get status label
 */
export function getStatusLabel(status: ApplicationStatus): string {
    const statusLabels = {
        applied: 'Applied',
        interview: 'Interview',
        'on-hold': 'On Hold',
        rejected: 'Rejected',
    };
    return statusLabels[status];
}

/**
 * Combine Job and JobApplication data for UI display
 */
export interface EnrichedJobApplication extends JobApplication {
    title: string;
    company: string;
    location: string;
    salary: string;
    appliedDate: string;
    status: ApplicationStatus;
}

/**
 * Transform backend data to frontend format
 * Note: Until backend adds status field, we'll default to 'applied'
 * This can be extended with local storage or separate status tracking
 */
export function enrichJobApplication(
    application: JobApplication,
    job?: Job,
    customStatus?: ApplicationStatus,
): EnrichedJobApplication {
    return {
        ...application,
        title: job?.title || application.jobTitle || 'Unknown Position',
        company:
            job?.companyName || application.companyName || 'Unknown Company',
        location: job?.location || 'Remote',
        salary: job
            ? formatSalary(job.salaryMin, job.salaryMax, job.currency)
            : application.salaryMin && application.salaryMax
              ? formatSalary(
                    application.salaryMin,
                    application.salaryMax,
                    application.salaryCurrency || 'USD',
                )
              : 'Not specified',
        appliedDate: formatDate(application.appliedAt),
        status: customStatus || 'applied', // Default status until backend supports it
    };
}

/**
 * Group applications by status for kanban view
 */
export function groupByStatus(
    applications: EnrichedJobApplication[],
): Record<ApplicationStatus, EnrichedJobApplication[]> {
    return {
        applied: applications.filter(app => app.status === 'applied'),
        interview: applications.filter(app => app.status === 'interview'),
        'on-hold': applications.filter(app => app.status === 'on-hold'),
        rejected: applications.filter(app => app.status === 'rejected'),
    };
}

/**
 * Filter applications by search query
 */
export function filterApplications(
    applications: EnrichedJobApplication[],
    searchQuery: string,
): EnrichedJobApplication[] {
    if (!searchQuery.trim()) return applications;

    const query = searchQuery.toLowerCase();
    return applications.filter(
        app =>
            app.title.toLowerCase().includes(query) ||
            app.company.toLowerCase().includes(query) ||
            app.location.toLowerCase().includes(query),
    );
}

/**
 * Sort applications by date
 */
export function sortByDate(
    applications: EnrichedJobApplication[],
    order: 'asc' | 'desc' = 'desc',
): EnrichedJobApplication[] {
    return [...applications].sort((a, b) => {
        const dateA = new Date(a.appliedAt).getTime();
        const dateB = new Date(b.appliedAt).getTime();
        return order === 'desc' ? dateB - dateA : dateA - dateB;
    });
}
