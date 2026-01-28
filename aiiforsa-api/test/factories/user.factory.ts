import { User } from '@prisma/client';

/**
 * Mock user factory for creating test user data
 */
export function createMockUser(overrides?: Partial<User>): User {
  return {
    id: 'test-user-' + Math.random().toString(36).substring(7),
    email: 'test@example.com',
    password: 'hashed-password',
    isActive: true,
    role: 'USER' as any,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    name: 'Test User',
    phone: null,
    gender: null,
    birthDate: null,
    timezone: 'UTC',
    preferredLanguage: 'en',
    address: null,
    city: null,
    state: null,
    country: null,
    postalCode: null,
    profileImage: null,
    bannerImage: null,
    bio: null,
    headline: null,
    currentPosition: null,
    currentCompany: null,
    industry: null,
    experienceLevel: null,
    yearsExperience: null,
    professionalSummary: null,
    desiredSalaryMin: null,
    desiredSalaryMax: null,
    salaryCurrency: 'USD',
    theme: 'LIGHT' as any,
    profileVisibility: 'PRIVATE' as any,
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    emailVerified: false,
    emailVerifiedAt: null,
    isOnboarded: false,
    onboardedAt: null,
    lastLoginAt: null,
    lastActiveAt: null,
    accountStatus: 'ACTIVE' as any,
    suspendedAt: null,
    suspendedReason: null,
    deletedAt: null,
    acceptedTermsAt: null,
    acceptedPrivacyPolicyAt: null,
    acceptedMarketingAt: null,
    ...overrides,
  } as User;
}

/**
 * Create multiple mock users
 */
export function createMockUsers(count: number): User[] {
  return Array.from({ length: count }, (_, i) =>
    createMockUser({
      id: `user-${i}`,
      email: `user${i}@example.com`,
      name: `Test User ${i}`,
    }),
  );
}

/**
 * Mock user skill factory
 */
export function createMockUserSkill(overrides?: any) {
  return {
    id: 'skill-' + Math.random().toString(36).substring(7),
    userId: 'test-user-123',
    name: 'TypeScript',
    level: 'INTERMEDIATE',
    yearsExperience: 3,
    category: null,
    order: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Mock work experience factory
 */
export function createMockWorkExperience(overrides?: any) {
  return {
    id: 'exp-' + Math.random().toString(36).substring(7),
    userId: 'test-user-123',
    jobTitle: 'Senior Software Engineer',
    company: 'Tech Corp',
    location: 'San Francisco, CA',
    startDate: new Date('2020-01-01'),
    endDate: null,
    isCurrent: true,
    description: 'Leading the development team',
    order: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Mock education factory
 */
export function createMockEducation(overrides?: any) {
  return {
    id: 'edu-' + Math.random().toString(36).substring(7),
    userId: 'test-user-123',
    institution: 'MIT',
    degree: 'Bachelor of Science',
    fieldOfStudy: 'Computer Science',
    location: 'Cambridge, MA',
    startDate: new Date('2015-09-01'),
    endDate: new Date('2019-05-31'),
    isCurrent: false,
    gpa: '3.8',
    description: 'Focused on Artificial Intelligence',
    order: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Mock certification factory
 */
export function createMockCertification(overrides?: any) {
  return {
    id: 'cert-' + Math.random().toString(36).substring(7),
    userId: 'test-user-123',
    name: 'AWS Certified Solutions Architect',
    issuer: 'Amazon Web Services',
    issueDate: new Date('2023-01-15'),
    expiryDate: new Date('2025-01-15'),
    credentialId: 'CERT-123456',
    credentialUrl: 'https://aws.amazon.com/verify/cert123456',
    description: 'Professional level certification',
    order: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Mock project factory
 */
export function createMockProject(overrides?: any) {
  return {
    id: 'proj-' + Math.random().toString(36).substring(7),
    userId: 'test-user-123',
    name: 'AI Chat Bot',
    description: 'An intelligent chat application powered by GPT',
    role: 'Full Stack Developer',
    startDate: new Date('2023-01-01'),
    endDate: null,
    isCurrent: true,
    url: 'https://github.com/testuser/ai-chatbot',
    technologies: 'TypeScript, React, Node.js, OpenAI',
    highlights: 'Led architecture, implemented real-time features',
    order: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Mock language factory
 */
export function createMockLanguage(overrides?: any) {
  return {
    id: 'lang-' + Math.random().toString(36).substring(7),
    userId: 'test-user-123',
    language: 'English',
    proficiency: 'NATIVE_OR_BILINGUAL',
    order: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Mock social link factory
 */
export function createMockSocialLink(overrides?: any) {
  return {
    id: 'social-' + Math.random().toString(36).substring(7),
    userId: 'test-user-123',
    type: 'GITHUB',
    url: 'https://github.com/testuser',
    label: 'testuser',
    isPrimary: true,
    order: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Create a complete user profile with all CV data
 */
export function createMockUserProfile(userId = 'test-user-123') {
  return {
    ...createMockUser({ id: userId }),
    skills: [
      createMockUserSkill({ userId }),
      createMockUserSkill({ userId, name: 'React', level: 'ADVANCED' }),
    ],
    workExperiences: [
      createMockWorkExperience({ userId }),
      createMockWorkExperience({
        userId,
        id: 'exp-2',
        jobTitle: 'Junior Developer',
        company: 'Startup Inc',
        endDate: new Date('2020-01-01'),
        isCurrent: false,
      }),
    ],
    educations: [createMockEducation({ userId })],
    certifications: [createMockCertification({ userId })],
    projects: [
      createMockProject({ userId }),
      createMockProject({
        userId,
        id: 'proj-2',
        name: 'E-commerce Platform',
        isCurrent: false,
        endDate: new Date('2023-06-01'),
      }),
    ],
    languages: [
      createMockLanguage({ userId }),
      createMockLanguage({
        userId,
        id: 'lang-2',
        language: 'French',
        proficiency: 'PROFESSIONAL_WORKING',
      }),
    ],
    socialLinks: [
      createMockSocialLink({ userId }),
      createMockSocialLink({
        userId,
        id: 'social-2',
        type: 'LINKEDIN',
        url: 'https://linkedin.com/in/testuser',
        label: 'testuser',
      }),
    ],
  };
}
