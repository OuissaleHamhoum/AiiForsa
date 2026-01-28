import { Test, TestingModule } from '@nestjs/testing';
import { JobRecommendationController } from './job-recommendation.controller';
import { JobRecommendationService } from './job-recommendation.service';

describe('JobRecommendationController', () => {
  let controller: JobRecommendationController;
  let service: JobRecommendationService;

  const mockJobRecommendation = {
    recommendationId: 'rec-1',
    userId: 'user-1',
    jobId: 'job-1',
    matchScore: 85,
    description: 'Great match',
    status: 'NOT_ADDED' as const,
    generatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobRecommendationController],
      providers: [
        {
          provide: JobRecommendationService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            getOne: jest.fn(),
            getAdded: jest.fn(),
            searchByDescription: jest.fn(),
            addToList: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<JobRecommendationController>(
      JobRecommendationController,
    );
    service = module.get<JobRecommendationService>(JobRecommendationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a job recommendation', async () => {
      const createDto = {
        userId: 'user-1',
        jobId: 'job-1',
        matchScore: 85,
        description: 'Great match',
        status: 'NOT_ADDED' as const,
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockJobRecommendation);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockJobRecommendation);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('search', () => {
    it('should search recommendations by keyword', async () => {
      const searchResults = [mockJobRecommendation];

      jest
        .spyOn(service, 'searchByDescription')
        .mockResolvedValue(searchResults);

      const result = await controller.search('match');

      expect(result).toEqual(searchResults);
      expect(service.searchByDescription).toHaveBeenCalledWith('match');
    });
  });

  describe('getMyAdded', () => {
    it('should get added recommendations for current user', async () => {
      const added = { ...mockJobRecommendation, status: 'ADDED' as const };

      jest.spyOn(service, 'getAdded').mockResolvedValue(added);

      const result = await controller.getMyAdded('user-1');

      expect(result).toEqual(added);
      expect(service.getAdded).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getAdded', () => {
    it('should get added recommendations for specific user (admin)', async () => {
      const added = { ...mockJobRecommendation, status: 'ADDED' as const };

      jest.spyOn(service, 'getAdded').mockResolvedValue(added);

      const result = await controller.getAdded('user-1');

      expect(result).toEqual(added);
      expect(service.getAdded).toHaveBeenCalledWith('user-1');
    });
  });

  describe('findAll', () => {
    it('should return all recommendations (admin)', async () => {
      const recommendations = [
        {
          ...mockJobRecommendation,
          user: {
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com',
          },
        },
      ] as any;

      jest.spyOn(service, 'findAll').mockResolvedValue(recommendations);

      const result = await controller.findAll();

      expect(result).toEqual(recommendations);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a recommendation by ID when user is owner', async () => {
      const recommendation = {
        ...mockJobRecommendation,
        userId: '1', // Match the userId being passed in
      };

      jest.spyOn(service, 'getOne').mockResolvedValue(recommendation as any);

      const result = await controller.findOne('rec-1', 1 as any);

      expect(result).toEqual(recommendation);
      expect(service.getOne).toHaveBeenCalledWith('rec-1');
    });
  });

  describe('update', () => {
    it('should update recommendation to ADDED status', async () => {
      const updated = { ...mockJobRecommendation, status: 'ADDED' as const };

      jest.spyOn(service, 'getOne').mockResolvedValue(mockJobRecommendation);
      jest.spyOn(service, 'addToList').mockResolvedValue(updated);

      const result = await controller.update('rec-1', 'user-1');

      expect(result).toEqual(updated);
      expect(service.addToList).toHaveBeenCalledWith('rec-1');
    });
  });

  describe('remove', () => {
    it('should delete a recommendation (admin)', async () => {
      const response = { message: 'JobRecommendation deleted successfully' };

      jest.spyOn(service, 'remove').mockResolvedValue(response);

      const result = await controller.remove('rec-1');

      expect(result).toEqual(response);
      expect(service.remove).toHaveBeenCalledWith('rec-1');
    });
  });
});
