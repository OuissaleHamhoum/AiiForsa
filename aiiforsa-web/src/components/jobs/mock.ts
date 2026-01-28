import { JobItem, JobType } from './types';

const TITLES = [
    'Senior Software Architect',
    'Full Stack Developer',
    'Frontend Engineer',
    'DevOps Engineer',
    'Backend Engineer',
    'Product Designer',
];

const COMPANIES = [
    'Tech Innovations Inc.',
    'StartupXYZ',
    'Digital Solutions Co.',
    'Cloud Systems Ltd.',
    'NextGen Labs',
];

const LOCATIONS = [
    'San Francisco, CA',
    'New York, NY',
    'Remote',
    'Berlin, DE',
    'Paris, FR',
];

const TYPES: JobType[] = ['Full-time', 'Part-time', 'Contract', 'Remote'];

const BENEFITS = [
    'Health Insurance',
    'Remote Work',
    '401k Match',
    'Stock Options',
    'Learning Budget',
];

function rand<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateMockJobs(count = 4): JobItem[] {
    return Array.from({ length: count }).map((_, i) => {
        const title = rand(TITLES);
        const company = rand(COMPANIES);
        const location = rand(LOCATIONS);
        const type = rand(TYPES);
        const salaryMin = randInt(60, 150) * 1000;
        const salaryMax = salaryMin + randInt(10, 60) * 1000;
        const daysAgo = randInt(0, 14);
        const matchPercent = randInt(35, 98);
        return {
            id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
            title,
            company,
            location,
            salaryMin,
            salaryMax,
            type,
            postedAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
            description:
                'We are looking for an experienced professional to design and implement scalable cloud-based solutions.',
            requirements: [
                '3+ years of relevant experience',
                'Strong knowledge of cloud and containers',
                'Experience with microservices and CI/CD',
                'Excellent communication skills',
            ],
            benefits: BENEFITS.sort(() => 0.5 - Math.random()).slice(0, 3),
            matchPercent,
        };
    });
}

export function matchColor(percent: number) {
    if (percent < 50) return 'text-red-500';
    if (percent < 70) return 'text-yellow-500';
    if (percent < 90) return 'text-green-500';
    return 'text-blue-500';
}
