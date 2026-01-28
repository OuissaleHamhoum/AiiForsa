import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createMockPrismaService } from '../../../test/setup';
import { PrismaService } from '../../database/prisma.service';
import { JobApplicationService } from './job-application.service';

describe('JobApplicationService', () => {
  let service: JobApplicationService;
  let prisma: PrismaService;

  const mockJobApplication = {
    applicationId: 'app-123',
    userId: 'user-123',
    jobId: 1,
    jobTitle: 'Software Engineer',
    companyName: 'Tech Corp',
    appliedAt: new Date('2025-01-01'),
    cvId: 'cv-123',
    coverLetterId: null,
    isExternal: false,
    user: {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
    },
  };

  const mockPrismaService = createMockPrismaService();

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobApplicationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<JobApplicationService>(JobApplicationService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a new job application', async () => {
      const createJobApplicationDto = {
        userId: 'user-123',
        jobId: 1,
        jobTitle: 'Software Engineer',
        companyName: 'Tech Corp',
        cvId: 'cv-123',
      };

      mockPrismaService.jobApplication = {
        create: jest.fn().mockResolvedValue(mockJobApplication),
      } as any;

      const result = await service.create(createJobApplicationDto);

      expect(result).toEqual(mockJobApplication);
      expect(mockPrismaService.jobApplication.create).toHaveBeenCalledWith({
        data: createJobApplicationDto,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated applications', async () => {
      const mockApplications = [
        mockJobApplication,
        { ...mockJobApplication, applicationId: 'app-124' },
      ];

      mockPrismaService.jobApplication = {
        findMany: jest.fn().mockResolvedValue(mockApplications),
        count: jest.fn().mockResolvedValue(10),
      } as any;

      const result = await service.findAll(1, 10);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(10);
      expect(result.meta.page).toBe(1);
    });

    it('should calculate correct pagination metadata', async () => {
      mockPrismaService.jobApplication = {
        findMany: jest.fn().mockResolvedValue([mockJobApplication]),
        count: jest.fn().mockResolvedValue(25),
      } as any;

      const result = await service.findAll(2, 10);

      expect(result.meta.totalPages).toBe(3);
      expect(result.meta.limit).toBe(10);
    });
  });

  describe('findOne', () => {
    it('should return a single job application', async () => {
      mockPrismaService.jobApplication = {
        findUnique: jest.fn().mockResolvedValue(mockJobApplication),
      } as any;

      const result = await service.findOne('app-123');

      expect(result).toEqual(mockJobApplication);
      expect(mockPrismaService.jobApplication.findUnique).toHaveBeenCalledWith({
        where: { applicationId: 'app-123' },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      });
    });

    it('should throw NotFoundException when application not found', async () => {
      mockPrismaService.jobApplication = {
        findUnique: jest.fn().mockResolvedValue(null),
      } as any;

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByUser', () => {
    it('should return applications by user id', async () => {
      const mockApplications = [mockJobApplication];

      mockPrismaService.jobApplication = {
        findMany: jest.fn().mockResolvedValue(mockApplications),
        count: jest.fn().mockResolvedValue(1),
      } as any;

      const result = await service.findByUser('user-123', 1, 10);

      expect(result.data).toEqual(mockApplications);
      expect(result.meta.total).toBe(1);
      expect(mockPrismaService.jobApplication.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        skip: 0,
        take: 10,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { appliedAt: 'desc' },
      });
    });
  });

  describe('findByJob', () => {
    it('should return applications by job id', async () => {
      const mockApplications = [
        mockJobApplication,
        { ...mockJobApplication, applicationId: 'app-124' },
      ];

      mockPrismaService.jobApplication = {
        findMany: jest.fn().mockResolvedValue(mockApplications),
        count: jest.fn().mockResolvedValue(2),
      } as any;

      const result = await service.findByJob(1, 1, 10);

      expect(result.data).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(mockPrismaService.jobApplication.findMany).toHaveBeenCalledWith({
        where: { jobId: 1 },
        skip: 0,
        take: 10,
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { appliedAt: 'desc' },
      });
    });
  });

  describe('update', () => {
    it('should update an application', async () => {
      const updateDto = { jobTitle: 'Senior Software Engineer' };
      const updatedApplication = {
        ...mockJobApplication,
        ...updateDto,
      };

      mockPrismaService.jobApplication = {
        findUnique: jest.fn().mockResolvedValue(mockJobApplication),
        update: jest.fn().mockResolvedValue(updatedApplication),
      } as any;

      const result = await service.update('app-123', updateDto);

      expect(result).toEqual(updatedApplication);
      expect(mockPrismaService.jobApplication.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when application not found for update', async () => {
      mockPrismaService.jobApplication = {
        findUnique: jest.fn().mockResolvedValue(null),
      } as any;

      await expect(
        service.update('nonexistent', { jobTitle: 'New Title' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete an application', async () => {
      const expectedResult = {
        message: 'Job application deleted successfully',
      };

      mockPrismaService.jobApplication = {
        findUnique: jest.fn().mockResolvedValue(mockJobApplication),
        delete: jest.fn().mockResolvedValue(mockJobApplication),
      } as any;

      const result = await service.remove('app-123');

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.jobApplication.delete).toHaveBeenCalledWith({
        where: { applicationId: 'app-123' },
      });
    });

    it('should throw NotFoundException when deleting non-existent application', async () => {
      mockPrismaService.jobApplication = {
        findUnique: jest.fn().mockResolvedValue(null),
      } as any;

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
