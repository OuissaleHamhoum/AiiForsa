import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../src/database/prisma.service';

// Mock @gradio/client to avoid ES module issues in tests
jest.mock('@gradio/client', () => ({
  Client: {
    connect: jest.fn().mockResolvedValue({
      predict: jest.fn().mockResolvedValue({ data: ['Mocked response'] }),
      submit: jest.fn().mockResolvedValue({ data: ['Mocked response'] }),
    }),
  },
}));

/**
 * Create a mock PrismaService for testing
 * Use this in your test modules when you need to mock database operations
 */
export function createMockPrismaService() {
  return {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn(),
    },
    userSkill: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn(),
    },
    userWorkExperience: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn(),
    },
    userEducation: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn(),
    },
    userCertification: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn(),
    },
    userProject: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn(),
    },
    userLanguage: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn(),
    },
    userSocialLink: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn(),
    },
    jobApplication: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn(),
    },
    job: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn(),
    },
    interview: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn(),
    },
    jobRecommendation: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn(),
    },
  };
}

/**
 * Setup a NestJS test module with mock Prisma service
 * Use this helper to quickly create a test module
 *
 * Example:
 * ```
 * const { module, prismaService } = await createTestingModule(
 *   UserService,
 *   [UserService]
 * );
 * ```
 */
export async function setupTestingModule(
  imports?: any[],
  controllers?: any[],
  providers?: any[],
) {
  const mockPrisma = createMockPrismaService();

  const providerList = providers || [];
  if (!providerList.some((p) => p?.provide === PrismaService)) {
    providerList.push({
      provide: PrismaService,
      useValue: mockPrisma,
    });
  }

  const module: TestingModule = await Test.createTestingModule({
    imports: imports || [],
    controllers: controllers || [],
    providers: providerList,
  }).compile();

  return {
    module,
    prismaService: module.get<any>(PrismaService),
    get<T>(token: any): T {
      return module.get<T>(token);
    },
  };
}

/**
 * Common test data for use across all tests
 */
export const TEST_DATA = {
  USER_ID: 'test-user-123',
  ADMIN_ID: 'test-admin-123',
  SKILL_ID: 'test-skill-123',
  JOB_ID: 'test-job-123',
  APPLICATION_ID: 'test-app-123',
  INTERVIEW_ID: 'test-interview-123',
};

/**
 * Test utilities
 */
export const TestUtils = {
  /**
   * Create a random ID for testing
   */
  generateId: (prefix = 'test') =>
    `${prefix}-${Math.random().toString(36).substring(7)}`,

  /**
   * Reset all jest mocks
   */
  resetAllMocks: () => jest.clearAllMocks(),

  /**
   * Check if a value is a valid UUID
   */
  isValidUUID: (value: string): boolean => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  },
};
