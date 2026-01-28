import { Test, TestingModule } from '@nestjs/testing';
import { JobApplicationController } from './job-application.controller';
import { JobApplicationService } from './job-application.service';

describe('JobApplicationController', () => {
  let controller: JobApplicationController;
  let service: JobApplicationService;

  const mockJobApplication = {
    applicationId: 'app-123',
    userId: 'user-123',
    jobId: 1,
    jobTitle: 'Software Engineer',
    companyName: 'Tech Corp',
    appliedAt: new Date('2025-01-01'),
    cvId: 'cv-123',
    user: {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@example.com',
    },
  };

  const mockJobApplicationService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByUser: jest.fn(),
    findByJob: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobApplicationController],
      providers: [
        {
          provide: JobApplicationService,
          useValue: mockJobApplicationService,
        },
      ],
    }).compile();

    controller = module.get<JobApplicationController>(JobApplicationController);
    service = module.get<JobApplicationService>(JobApplicationService);
  });

  describe('POST /job-applications', () => {
    it('should create a new job application', async () => {
      const createJobApplicationDto = {
        userId: 'user-123',
        jobId: 1,
        jobTitle: 'Software Engineer',
        companyName: 'Tech Corp',
        cvId: 'cv-123',
      };

      mockJobApplicationService.create.mockResolvedValue(mockJobApplication);

      const result = await controller.create(
        createJobApplicationDto,
        'user-123',
      );

      expect(result).toEqual(mockJobApplication);
      expect(service.create).toHaveBeenCalledWith(
        expect.objectContaining(createJobApplicationDto),
      );
    });
  });

  describe('GET /job-applications', () => {
    it('should return all job applications with pagination', async () => {
      const mockApplications = [
        mockJobApplication,
        { ...mockJobApplication, applicationId: 'app-124' },
      ];
      const expectedResult = {
        data: mockApplications,
        meta: { total: 2, page: 1, limit: 10, totalPages: 1 },
      };

      mockJobApplicationService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(1, 10);

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('GET /job-applications/me', () => {
    it('should return current user job applications', async () => {
      const mockApplications = [mockJobApplication];
      const expectedResult = {
        data: mockApplications,
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };

      mockJobApplicationService.findByUser.mockResolvedValue(expectedResult);

      const result = await controller.findMyApplications('user-123', 1, 10);

      expect(result).toEqual(expectedResult);
      expect(service.findByUser).toHaveBeenCalledWith('user-123', 1, 10);
    });
  });

  describe('GET /job-applications/:applicationId', () => {
    it('should return a single job application', async () => {
      mockJobApplicationService.findOne.mockResolvedValue(mockJobApplication);

      const result = await controller.findOne('app-123', 'user-123');

      expect(result).toEqual(mockJobApplication);
      expect(service.findOne).toHaveBeenCalledWith('app-123');
    });

    it('should handle application not found', async () => {
      mockJobApplicationService.findOne.mockRejectedValue(
        new Error('Not found'),
      );

      await expect(
        controller.findOne('nonexistent', 'user-123'),
      ).rejects.toThrow('Not found');
    });
  });

  describe('GET /job-applications/job/:jobId', () => {
    it('should return applications for a specific job', async () => {
      const mockApplications = [mockJobApplication];
      const expectedResult = {
        data: mockApplications,
        meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
      };

      mockJobApplicationService.findByJob.mockResolvedValue(expectedResult);

      const result = await controller.findByJob(1, 1, 10);

      expect(result).toEqual(expectedResult);
      expect(service.findByJob).toHaveBeenCalledWith(1, 1, 10);
    });
  });

  describe('PATCH /job-applications/:applicationId', () => {
    it('should update a job application', async () => {
      const updateJobApplicationDto = { jobTitle: 'Senior Engineer' };
      const updatedApplication = {
        ...mockJobApplication,
        ...updateJobApplicationDto,
      };

      mockJobApplicationService.findOne.mockResolvedValue(mockJobApplication);
      mockJobApplicationService.update.mockResolvedValue(updatedApplication);

      const result = await controller.update(
        'app-123',
        updateJobApplicationDto,
        'user-123',
      );

      expect(result).toEqual(updatedApplication);
      expect(service.update).toHaveBeenCalledWith(
        'app-123',
        updateJobApplicationDto,
      );
    });
  });

  describe('DELETE /job-applications/:applicationId', () => {
    it('should delete a job application', async () => {
      mockJobApplicationService.findOne.mockResolvedValue(mockJobApplication);
      mockJobApplicationService.remove.mockResolvedValue({
        message: 'Deleted',
      });

      const result = await controller.remove('app-123', 'user-123');

      expect(service.remove).toHaveBeenCalledWith('app-123');
    });
  });
});
