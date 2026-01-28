import { Test, TestingModule } from '@nestjs/testing';
import { Difficulty, InterviewCategory } from '@prisma/client';
import { createMockPrismaService } from '../../../test/setup';
import { PrismaService } from '../../database/prisma.service';
import { InterviewService } from './interview.service';

describe('InterviewService', () => {
  let service: InterviewService;
  let prisma: PrismaService;

  const mockPrismaService = createMockPrismaService();

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<InterviewService>(InterviewService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create interview with auto-generated questions', async () => {
      const createInterviewDto: any = {
        userId: 'user-123',
        description: 'Tech interview',
        durationMinutes: 45,
        nbrQuestions: 3,
        difficulty: Difficulty.MEDIUM,
        category: InterviewCategory.TECHNICAL,
        focusArea: 'System Design',
      };

      const mockInterview = {
        interviewId: 'int-123',
        ...createInterviewDto,
      };

      mockPrismaService.interview = {
        create: jest.fn().mockResolvedValue(mockInterview),
      } as any;

      const result = await service.create(createInterviewDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.interview.create).toHaveBeenCalled();
    });

    it('should create interview with provided questions', async () => {
      const createInterviewDto: any = {
        userId: 'user-123',
        description: 'Tech interview',
        durationMinutes: 45,
        nbrQuestions: 2,
        difficulty: Difficulty.EASY,
        category: InterviewCategory.BEHAVIORAL,
        focusArea: 'Problem Solving',
        questions: [{ content: 'Question 1' }, { content: 'Question 2' }],
      };

      const mockInterview = {
        interviewId: 'int-123',
        ...createInterviewDto,
      };

      mockPrismaService.interview = {
        create: jest.fn().mockResolvedValue(mockInterview),
      } as any;

      const result = await service.create(createInterviewDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.interview.create).toHaveBeenCalled();
    });
  });

  describe('generateInterviewReport', () => {
    it('should throw error when interview not found', async () => {
      mockPrismaService.interview = {
        findUnique: jest.fn().mockResolvedValue(null),
      } as any;

      await expect(
        service.generateInterviewReport('nonexistent'),
      ).rejects.toThrow('Interview not found');
    });
  });
});
