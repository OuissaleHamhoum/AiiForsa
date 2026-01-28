import { Test, TestingModule } from '@nestjs/testing';
import { CommunityController } from './community.controller';
import { CommunityService } from './community.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CreatePostDto,
  UpdatePostDto,
  CreateCommentDto,
  PaginationQueryDto,
} from './dto/create-post.dto';

describe('CommunityController', () => {
  let controller: CommunityController;
  let service: CommunityService;

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    role: 'USER',
  };

  const mockRequest = {
    user: mockUser,
  };

  const mockPost = {
    id: '1',
    caption: 'Test Post',
    imageUrl: 'https://example.com/image.jpg',
    authorId: mockUser.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    author: {
      id: mockUser.id,
      name: 'John Doe',
      email: mockUser.email,
      profileImage: null,
    },
    likes: [],
    comments: [],
    likedByCurrentUser: false,
  };

  const mockComment = {
    id: '1',
    text: 'Test comment',
    postId: '1',
    authorId: mockUser.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    author: {
      id: mockUser.id,
      name: 'John Doe',
      email: mockUser.email,
    },
  };

  const mockCommunityService = {
    getPosts: jest.fn(),
    createPost: jest.fn(),
    getPostById: jest.fn(),
    updatePost: jest.fn(),
    deletePost: jest.fn(),
    toggleLike: jest.fn(),
    addComment: jest.fn(),
    getComments: jest.fn(),
    getUserPosts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommunityController],
      providers: [
        {
          provide: CommunityService,
          useValue: mockCommunityService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CommunityController>(CommunityController);
    service = module.get<CommunityService>(CommunityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPosts', () => {
    it('should return paginated posts', async () => {
      const query: PaginationQueryDto = { page: 1, limit: 10 };
      const paginatedResult = {
        posts: [mockPost],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockCommunityService.getPosts.mockResolvedValue(paginatedResult);

      const result = await controller.getPosts(query, mockRequest);

      expect(result).toEqual({
        ...paginatedResult,
        posts: [
          {
            ...mockPost,
            likedByCurrentUser: false,
          },
        ],
      });
      expect(service.getPosts).toHaveBeenCalledWith(1, 10);
    });

    it('should return posts with default pagination', async () => {
      const query: PaginationQueryDto = {};
      const paginatedResult = {
        posts: [mockPost],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockCommunityService.getPosts.mockResolvedValue(paginatedResult);

      await controller.getPosts(query, mockRequest);

      expect(service.getPosts).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('createPost', () => {
    it('should create a new post', async () => {
      const createPostDto: CreatePostDto = {
        caption: 'Test Post',
        imageUrl: 'https://example.com/image.jpg',
      };

      mockCommunityService.createPost.mockResolvedValue(mockPost);

      const result = await controller.createPost(createPostDto, mockRequest);

      expect(result).toEqual(mockPost);
      expect(service.createPost).toHaveBeenCalledWith(
        mockUser.id,
        createPostDto,
      );
    });

    it('should handle service errors', async () => {
      const createPostDto: CreatePostDto = {
        caption: 'Test Post',
      };

      mockCommunityService.createPost.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(
        controller.createPost(createPostDto, mockRequest),
      ).rejects.toThrow('Database error');
    });
  });

  describe('getPostById', () => {
    it('should return a post by id', async () => {
      mockCommunityService.getPostById.mockResolvedValue(mockPost);

      const result = await controller.getPostById('1', mockRequest);

      expect(result).toEqual(mockPost);
      expect(service.getPostById).toHaveBeenCalledWith('1', mockUser.id);
    });

    it('should return null for non-existent post', async () => {
      mockCommunityService.getPostById.mockResolvedValue(null);

      const result = await controller.getPostById('999', mockRequest);

      expect(result).toBeNull();
      expect(service.getPostById).toHaveBeenCalledWith('999', mockUser.id);
    });
  });

  describe('updatePost', () => {
    it('should update a post', async () => {
      const updatePostDto: UpdatePostDto = {
        caption: 'Updated caption',
      };

      const updatedPost = { ...mockPost, ...updatePostDto };
      mockCommunityService.updatePost.mockResolvedValue(updatedPost);

      const result = await controller.updatePost(
        '1',
        updatePostDto,
        mockRequest,
      );

      expect(result).toEqual(updatedPost);
      expect(service.updatePost).toHaveBeenCalledWith(
        '1',
        mockUser.id,
        updatePostDto,
      );
    });

    it('should handle service errors', async () => {
      const updatePostDto: UpdatePostDto = {
        caption: 'Updated caption',
      };

      mockCommunityService.updatePost.mockRejectedValue(
        new Error('Unauthorized'),
      );

      await expect(
        controller.updatePost('1', updatePostDto, mockRequest),
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('deletePost', () => {
    it('should delete a post', async () => {
      mockCommunityService.deletePost.mockResolvedValue(undefined);

      const result = await controller.deletePost('1', mockRequest);

      expect(result).toBeUndefined();
      expect(service.deletePost).toHaveBeenCalledWith('1', mockUser.id);
    });

    it('should handle service errors', async () => {
      mockCommunityService.deletePost.mockRejectedValue(
        new Error('Unauthorized'),
      );

      await expect(controller.deletePost('1', mockRequest)).rejects.toThrow(
        'Unauthorized',
      );
    });
  });

  describe('toggleLike', () => {
    it('should toggle like on a post', async () => {
      const likeResult = {
        id: '1',
        postId: '1',
        userId: mockUser.id,
        createdAt: new Date(),
      };

      mockCommunityService.toggleLike.mockResolvedValue(likeResult);

      const result = await controller.toggleLike('1', mockRequest);

      expect(result).toEqual(likeResult);
      expect(service.toggleLike).toHaveBeenCalledWith('1', mockUser.id);
    });

    it('should handle service errors', async () => {
      mockCommunityService.toggleLike.mockRejectedValue(
        new Error('Post not found'),
      );

      await expect(controller.toggleLike('999', mockRequest)).rejects.toThrow(
        'Post not found',
      );
    });
  });

  describe('addComment', () => {
    it('should add a comment to a post', async () => {
      const createCommentDto: CreateCommentDto = {
        text: 'Test comment',
      };

      mockCommunityService.addComment.mockResolvedValue(mockComment);

      const result = await controller.addComment(
        '1',
        createCommentDto,
        mockRequest,
      );

      expect(result).toEqual(mockComment);
      expect(service.addComment).toHaveBeenCalledWith(
        '1',
        mockUser.id,
        'Test comment',
      );
    });

    it('should handle service errors', async () => {
      const createCommentDto: CreateCommentDto = {
        text: 'Test comment',
      };

      mockCommunityService.addComment.mockRejectedValue(
        new Error('Post not found'),
      );

      await expect(
        controller.addComment('999', createCommentDto, mockRequest),
      ).rejects.toThrow('Post not found');
    });
  });

  describe('getComments', () => {
    it('should get all comments for a post', async () => {
      const comments = [mockComment];
      const query: PaginationQueryDto = { page: 1, limit: 20 };

      mockCommunityService.getComments.mockResolvedValue(comments);

      const result = await controller.getComments('1', query);

      expect(result).toEqual(comments);
      expect(service.getComments).toHaveBeenCalledWith('1', 1, 20);
    });

    it('should return empty array for post with no comments', async () => {
      const query: PaginationQueryDto = {};

      mockCommunityService.getComments.mockResolvedValue([]);

      const result = await controller.getComments('1', query);

      expect(result).toEqual([]);
      expect(service.getComments).toHaveBeenCalledWith('1', 1, 20);
    });
  });

  describe('getUserPosts', () => {
    it('should get posts for a specific user', async () => {
      const query: PaginationQueryDto = { page: 1, limit: 10 };
      const userPosts = [mockPost];

      mockCommunityService.getUserPosts.mockResolvedValue(userPosts);

      const result = await controller.getUserPosts('1', query);

      expect(result).toEqual(userPosts);
      expect(service.getUserPosts).toHaveBeenCalledWith('1', 1, 10);
    });

    it('should handle with default pagination', async () => {
      const query: PaginationQueryDto = {};

      mockCommunityService.getUserPosts.mockResolvedValue([]);

      await controller.getUserPosts('1', query);

      expect(service.getUserPosts).toHaveBeenCalledWith('1', 1, 10);
    });
  });
});
