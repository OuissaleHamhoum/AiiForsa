import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../database/prisma.service';
import { CreateJobRecommendationDto } from './dto/create-job-recommendation.dto';
import { UpdateJobRecommendationDto } from './dto/update-job-recommendation.dto';
import { JobRecommendationService } from './job-recommendation.service';

describe('JobRecommendationService', () => {
  let service: JobRecommendationService;
  let prismaService: PrismaService;

  const mockJobRecommendation = {
    recommendationId: 'rec-1',
    userId: 'user-1',
    jobId: 'job-1',
    matchScore: 85,
    description: 'Great match for your profile',
    status: 'NOT_ADDED' as const,
    generatedAt: new Date(),
    user: {
      id: 'user-1',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    },
  };

  const createMockPrismaService = () => ({
    jobRecommendation: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobRecommendationService,
        {
          provide: PrismaService,
          useValue: createMockPrismaService(),
        },
      ],
    }).compile();

    service = module.get<JobRecommendationService>(JobRecommendationService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a job recommendation', async () => {
      const createDto: CreateJobRecommendationDto = {
        userId: 'user-1',
        jobId: 'job-1',
        matchScore: 85,
        description: 'Great match',
        status: 'NOT_ADDED',
      };
      jest
        .spyOn(prismaService.jobRecommendation, 'create')
        .mockResolvedValue(mockJobRecommendation);

      const result = await service.create(createDto);

      expect(result).toEqual(mockJobRecommendation);
      expect(prismaService.jobRecommendation.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });
  });

  describe('findAll', () => {
    it('should return all job recommendations with users', async () => {
      const mockRecommendations = [mockJobRecommendation];

      jest
        .spyOn(prismaService.jobRecommendation, 'findMany')
        .mockResolvedValue(mockRecommendations);

      const result = await service.findAll();

      expect(result).toEqual(mockRecommendations);
      expect(prismaService.jobRecommendation.findMany).toHaveBeenCalledWith({
        include: { user: true },
      });
    });

    it('should return empty array when no recommendations exist', async () => {
      jest
        .spyOn(prismaService.jobRecommendation, 'findMany')
        .mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('getOneForUser', () => {
    it('should get recommendation for specific user', async () => {
      const selectedFields = {
        recommendationId: 'rec-1',
        userId: 'user-1',
        jobId: 'job-1',
        matchScore: 85,
        description: 'Great match',
        status: 'NOT_ADDED' as const,
        generatedAt: new Date(),
      };

      jest
        .spyOn(prismaService.jobRecommendation, 'findFirst')
        .mockResolvedValue(selectedFields as any);

      const result = await service.getOneForUser('rec-1', 'user-1');

      expect(result).toEqual(selectedFields);
      expect(prismaService.jobRecommendation.findFirst).toHaveBeenCalledWith({
        where: {
          recommendationId: 'rec-1',
          userId: 'user-1',
        },
        select: {
          recommendationId: true,
          userId: true,
          jobId: true,
          matchScore: true,
          description: true,
          status: true,
          generatedAt: true,
        },
      });
    });

    it('should throw NotFoundException when recommendation not found for user', async () => {
      jest
        .spyOn(prismaService.jobRecommendation, 'findFirst')
        .mockResolvedValue(null);

      await expect(service.getOneForUser('rec-999', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getOne', () => {
    it('should get a recommendation by ID', async () => {
      const selectedFields = {
        recommendationId: 'rec-1',
        userId: 'user-1',
        jobId: 'job-1',
        matchScore: 85,
        description: 'Great match',
        status: 'NOT_ADDED' as const,
        generatedAt: new Date(),
      };

      jest
        .spyOn(prismaService.jobRecommendation, 'findUnique')
        .mockResolvedValue(selectedFields as any);

      const result = await service.getOne('rec-1');

      expect(result).toEqual(selectedFields);
    });

    it('should throw NotFoundException when recommendation not found', async () => {
      jest
        .spyOn(prismaService.jobRecommendation, 'findUnique')
        .mockResolvedValue(null);

      await expect(service.getOne('rec-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should find recommendation by ID with user details', async () => {
      jest
        .spyOn(prismaService.jobRecommendation, 'findUnique')
        .mockResolvedValue(mockJobRecommendation);

      const result = await service.findOne('rec-1');

      expect(result).toEqual(mockJobRecommendation);
      expect(prismaService.jobRecommendation.findUnique).toHaveBeenCalledWith({
        where: { recommendationId: 'rec-1' },
        include: { user: true },
      });
    });

    it('should throw NotFoundException when recommendation not found', async () => {
      jest
        .spyOn(prismaService.jobRecommendation, 'findUnique')
        .mockResolvedValue(null);

      await expect(service.findOne('rec-999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAdded', () => {
    it('should get ADDED recommendations for user', async () => {
      const addedRecommendation = {
        jobId: 'job-1',
        matchScore: 85,
        description: 'Great match',
        status: 'ADDED' as const,
        generatedAt: new Date(),
      };

      jest
        .spyOn(prismaService.jobRecommendation, 'findFirst')
        .mockResolvedValue(addedRecommendation as any);

      const result = await service.getAdded('user-1');

      expect(result).toEqual(addedRecommendation);
      expect(prismaService.jobRecommendation.findFirst).toHaveBeenCalledWith({
        where: {
          status: 'ADDED',
          userId: 'user-1',
        },
        select: {
          jobId: true,
          matchScore: true,
          description: true,
          status: true,
          generatedAt: true,
        },
      });
    });

    it('should throw NotFoundException when no ADDED recommendations exist', async () => {
      jest
        .spyOn(prismaService.jobRecommendation, 'findFirst')
        .mockResolvedValue(null);

      await expect(service.getAdded('user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('searchByDescription', () => {
    it('should search recommendations by keyword', async () => {
      const searchResults = [
        {
          matchScore: 85,
          description: 'Great match for your profile',
          status: 'NOT_ADDED' as const,
          generatedAt: new Date(),
        },
      ];

      jest
        .spyOn(prismaService.jobRecommendation, 'findMany')
        .mockResolvedValue(searchResults as any);

      const result = await service.searchByDescription('match');

      expect(result).toEqual(searchResults);
      expect(prismaService.jobRecommendation.findMany).toHaveBeenCalledWith({
        where: {
          description: {
            contains: 'match',
            mode: 'insensitive',
          },
        },
        select: {
          matchScore: true,
          description: true,
          status: true,
          generatedAt: true,
        },
      });
    });

    it('should throw NotFoundException when no search results found', async () => {
      jest
        .spyOn(prismaService.jobRecommendation, 'findMany')
        .mockResolvedValue([]);

      await expect(service.searchByDescription('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a job recommendation', async () => {
      const updateDto: UpdateJobRecommendationDto = {
        status: 'ADDED',
      };

      const updatedRecommendation = {
        ...mockJobRecommendation,
        status: 'ADDED' as const,
      };

      jest
        .spyOn(prismaService.jobRecommendation, 'findUnique')
        .mockResolvedValue(mockJobRecommendation as any);
      jest
        .spyOn(prismaService.jobRecommendation, 'update')
        .mockResolvedValue(updatedRecommendation as any);

      const result = await service.update('rec-1', updateDto);

      expect(result).toEqual(updatedRecommendation);
      expect(prismaService.jobRecommendation.update).toHaveBeenCalledWith({
        where: { recommendationId: 'rec-1' },
        data: updateDto,
      });
    });
  });

  describe('addToList', () => {
    it('should add recommendation to list (set status to ADDED)', async () => {
      const addedRecommendation = {
        ...mockJobRecommendation,
        status: 'ADDED' as const,
      };

      jest
        .spyOn(prismaService.jobRecommendation, 'findUnique')
        .mockResolvedValue(mockJobRecommendation as any);
      jest
        .spyOn(prismaService.jobRecommendation, 'update')
        .mockResolvedValue(addedRecommendation as any);

      const result = await service.addToList('rec-1');

      expect(result.status).toBe('ADDED');
      expect(prismaService.jobRecommendation.update).toHaveBeenCalledWith({
        where: { recommendationId: 'rec-1' },
        data: { status: 'ADDED' },
      });
    });
  });

  describe('remove', () => {
    it('should delete a job recommendation', async () => {
      jest
        .spyOn(prismaService.jobRecommendation, 'findUnique')
        .mockResolvedValue(mockJobRecommendation);
      jest
        .spyOn(prismaService.jobRecommendation, 'delete')
        .mockResolvedValue(mockJobRecommendation);

      const result = await service.remove('rec-1');

      expect(result).toEqual({
        message: 'JobRecommendation deleted successfully',
      });
      expect(prismaService.jobRecommendation.delete).toHaveBeenCalledWith({
        where: { recommendationId: 'rec-1' },
      });
    });
  });
});
