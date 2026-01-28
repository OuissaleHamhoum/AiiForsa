export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Remote';

export interface JobItem {
    id: string;
    title: string;
    company: string;
    location: string;
    salaryMin?: number;
    salaryMax?: number;
    type: JobType;
    postedAt: string; // ISO date
    description: string;
    requirements: string[];
    benefits: string[];
    externalUrl?: string | null;
}
