import { Test, TestingModule } from '@nestjs/testing';
import { ExperienceLevel, JobStatus, JobType } from '@prisma/client';
import { createMockPrismaService } from '../../../test/setup';
import { PrismaService } from '../../database/prisma.service';
import { JobService } from './job.service';

describe('JobService', () => {
  let service: JobService;
  let prisma: PrismaService;

  const mockJob = {
    id: 1,
    title: 'Software Engineer',
    description: 'Backend development role',
    location: 'New York',
    companyName: 'Tech Company',
    remote: false,
    postedAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    expiresAt: new Date('2025-02-01'),
    salaryMin: 80000,
    salaryMax: 120000,
    requirements: 'Bachelor degree required',
    currency: 'USD',
    status: JobStatus.OPEN,
    type: JobType.FULL_TIME,
    experienceLevel: ExperienceLevel.MID,
  };

  const mockPrismaService = createMockPrismaService();

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<JobService>(JobService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a new job', async () => {
      const createJobDto = {
        title: 'Software Engineer',
        description: 'Backend development role',
        location: 'New York',
        companyName: 'Tech Company',
        remote: false,
        postedAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        expiresAt: new Date('2025-02-01'),
        salaryMin: 80000,
        salaryMax: 120000,
        requirements: 'Bachelor degree required',
        currency: 'USD',
        status: JobStatus.OPEN,
        type: JobType.FULL_TIME,
        experienceLevel: ExperienceLevel.MID,
      };

      mockPrismaService.job = {
        create: jest.fn().mockResolvedValue(mockJob),
      } as any;

      const result = await service.create(createJobDto);

      expect(result).toEqual(mockJob);
      expect(mockPrismaService.job.create).toHaveBeenCalledWith({
        data: createJobDto,
      });
    });
  });

  describe('findAll', () => {
    it('should return array of all jobs', async () => {
      const mockJobs = [
        mockJob,
        { ...mockJob, id: 2, title: 'Frontend Engineer' },
      ];

      mockPrismaService.job = {
        findMany: jest.fn().mockResolvedValue(mockJobs),
      } as any;

      const result = await service.findAll();

      expect(result).toEqual(mockJobs);
      expect(result.length).toBe(2);
      expect(mockPrismaService.job.findMany).toHaveBeenCalled();
    });

    it('should return empty array when no jobs exist', async () => {
      mockPrismaService.job = {
        findMany: jest.fn().mockResolvedValue([]),
      } as any;

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('findOne', () => {
    it('should return a single job by id', async () => {
      mockPrismaService.job = {
        findUnique: jest.fn().mockResolvedValue(mockJob),
      } as any;

      const result = await service.findOne(1);

      expect(result).toEqual(mockJob);
      expect(mockPrismaService.job.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return null when job not found', async () => {
      mockPrismaService.job = {
        findUnique: jest.fn().mockResolvedValue(null),
      } as any;

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an existing job', async () => {
      const updateJobDto = { title: 'Senior Software Engineer' };
      const updatedJob = { ...mockJob, ...updateJobDto };

      mockPrismaService.job = {
        update: jest.fn().mockResolvedValue(updatedJob),
      } as any;

      const result = await service.update(1, updateJobDto as any);

      expect(result).toEqual(updatedJob);
      expect(mockPrismaService.job.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateJobDto,
      });
    });
  });

  describe('remove', () => {
    it('should delete a job', async () => {
      mockPrismaService.job = {
        delete: jest.fn().mockResolvedValue(mockJob),
      } as any;

      const result = await service.remove(1);

      expect(result).toEqual(mockJob);
      expect(mockPrismaService.job.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
