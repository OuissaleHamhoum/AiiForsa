import { Test, TestingModule } from '@nestjs/testing';
import { ExperienceLevel, JobStatus, JobType } from '@prisma/client';
import { AdzunaService } from './adzuna.service';
import { JobController } from './job.controller';
import { JobService } from './job.service';

describe('JobController', () => {
  let controller: JobController;
  let service: JobService;

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

  const mockJobService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockAdzunaService = {
    searchJobs: jest.fn(),
    getJobDetails: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobController],
      providers: [
        {
          provide: JobService,
          useValue: mockJobService,
        },
        {
          provide: AdzunaService,
          useValue: mockAdzunaService,
        },
      ],
    }).compile();

    controller = module.get<JobController>(JobController);
    service = module.get<JobService>(JobService);
  });

  describe('POST /jobs', () => {
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

      mockJobService.create.mockResolvedValue(mockJob);

      const result = await controller.create(createJobDto);

      expect(result).toEqual(mockJob);
      expect(service.create).toHaveBeenCalledWith(createJobDto);
    });
  });

  describe('GET /jobs', () => {
    it('should return all jobs', async () => {
      const mockJobs = [mockJob, { ...mockJob, id: 2 }];

      mockJobService.findAll.mockResolvedValue(mockJobs);

      const result = await controller.findAll();

      expect(result).toEqual(mockJobs);
      expect(result.length).toBe(2);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no jobs exist', async () => {
      mockJobService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('GET /jobs/:id', () => {
    it('should return job by id', async () => {
      mockJobService.findOne.mockResolvedValue(mockJob);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockJob);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should return null when job not found', async () => {
      mockJobService.findOne.mockResolvedValue(null);

      const result = await controller.findOne('999');

      expect(result).toBeNull();
      expect(service.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('PATCH /jobs/:id', () => {
    it('should update a job', async () => {
      const updateJobDto = { title: 'Senior Software Engineer' };
      const updatedJob = { ...mockJob, ...updateJobDto };

      mockJobService.update.mockResolvedValue(updatedJob);

      const result = await controller.update('1', updateJobDto as any);

      expect(result).toEqual(updatedJob);
      expect(service.update).toHaveBeenCalledWith(1, updateJobDto);
    });
  });

  describe('DELETE /jobs/:id', () => {
    it('should delete a job', async () => {
      mockJobService.remove.mockResolvedValue(mockJob);

      const result = await controller.remove('1');

      expect(result).toEqual(mockJob);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
