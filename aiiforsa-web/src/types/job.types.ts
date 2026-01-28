// Job Types from Backend

export type JobType =
    | 'FULL_TIME'
    | 'PART_TIME'
    | 'INTERNSHIP'
    | 'CONTRACT'
    | 'FREELANCE';
export type ExperienceLevel = 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD';
export type JobStatus = 'OPEN' | 'CLOSED' | 'PAUSED';

export interface Job {
    id: number;
    title: string;
    companyName: string;
    location: string | null;
    type: JobType | null;
    description: string | null;
    requirements: string | null;
    benefits: string | null;
    salaryMin: number | null;
    salaryMax: number | null;
    currency: string | null;
    experienceLevel: ExperienceLevel | null;
    remote: boolean;
    postedAt: string;
    expiresAt: string | null;
    status: JobStatus;
    createdAt: string;
    updatedAt: string;
    externalUrl?: string | null;
}

export interface CreateJobDto {
    title: string;
    companyName: string;
    location: string;
    description: string;
    requirements: string;
    type: JobType;
    salaryMin: number;
    salaryMax: number;
    experienceLevel: ExperienceLevel;
    postedAt: string;
    updatedAt: string;
    expiresAt: string;
    remote: boolean;
    status: JobStatus;
    currency?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateJobDto extends Partial<CreateJobDto> {}

// Job Application Types

export type ApplicationStatus =
    | 'applied'
    | 'interview'
    | 'on-hold'
    | 'rejected';

export interface JobApplication {
    applicationId: string;
    userId: string;
    jobId: string;
    cvId: string;
    coverLetterId: string;
    appliedAt: string;
    isExternal: boolean;
    // Job details stored in application
    jobTitle: string;
    companyName: string;
    salaryMin?: number;
    salaryMax?: number;
    salaryCurrency?: string;
    jobType?: string;
    experienceLevel?: string;
    // Extended fields for frontend UI (populated from job details)
    job?: Job;
    // Frontend-specific status field (we'll need to add this to backend or map from another field)
    status?: ApplicationStatus;
}

export interface CreateJobApplicationDto {
    userId: string;
    jobId: string;
    cvId: string;
    coverLetterId: string;
    appliedAt?: string;
    isExternal?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateJobApplicationDto
    extends Partial<CreateJobApplicationDto> {}

export interface JobApplicationStats {
    total: number;
    external: number;
    internal: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

// Interview Types (for Calendar view)
export interface Interview {
    id: string;
    applicationId: string;
    date: string;
    time: string;
    type: 'phone' | 'video' | 'in-person';
    interviewer?: string;
    notes?: string;
    job: {
        title: string;
        company: string;
    };
}
