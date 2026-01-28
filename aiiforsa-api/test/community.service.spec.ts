import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../src/database/prisma.service';
import { CommunityService } from '../src/modules/community/community.service';

describe('CommunityService', () => {
  let service: CommunityService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    post: {
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    like: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    comment: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CommunityService>(CommunityService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPosts', () => {
    it('should return paginated posts', async () => {
      const mockPosts = [
        {
          id: '1',
          caption: 'Test post',
          imageUrl: null,
          createdAt: new Date(),
          author: {
            id: '1',
            name: 'Test User',
            profileImage: null,
            headline: null,
          },
          likes: [],
          comments: [],
          _count: { likes: 5, comments: 3 },
        },
      ];

      mockPrismaService.post.findMany.mockResolvedValue(mockPosts);
      mockPrismaService.post.count.mockResolvedValue(1);

      const result = await service.getPosts(1, 10);

      expect(result.posts).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(mockPrismaService.post.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: expect.any(Object),
      });
    });
  });

  describe('createPost', () => {
    it('should create a new post', async () => {
      const mockPost = {
        id: '1',
        caption: 'New post',
        imageUrl: null,
        authorId: 'user-1',
        createdAt: new Date(),
        author: { id: 'user-1', name: 'Test User' },
        _count: { likes: 0, comments: 0 },
      };

      mockPrismaService.post.create.mockResolvedValue(mockPost);

      const result = await service.createPost('user-1', {
        caption: 'New post',
      });

      expect(result.id).toBe('1');
      expect(result.caption).toBe('New post');
      expect(mockPrismaService.post.create).toHaveBeenCalledWith({
        data: {
          caption: 'New post',
          imageUrl: undefined,
          authorId: 'user-1',
        },
        include: expect.any(Object),
      });
    });
  });

  describe('toggleLike', () => {
    it('should create a like if not exists', async () => {
      mockPrismaService.like.findUnique.mockResolvedValue(null);
      mockPrismaService.like.create.mockResolvedValue({
        userId: 'user-1',
        postId: 'post-1',
      });

      const result = await service.toggleLike('post-1', 'user-1');

      expect(result).toEqual({ liked: true });
      expect(mockPrismaService.like.create).toHaveBeenCalledWith({
        data: { userId: 'user-1', postId: 'post-1' },
      });
    });

    it('should remove a like if exists', async () => {
      mockPrismaService.like.findUnique.mockResolvedValue({
        userId: 'user-1',
        postId: 'post-1',
      });

      const result = await service.toggleLike('post-1', 'user-1');

      expect(result).toEqual({ liked: false });
      expect(mockPrismaService.like.delete).toHaveBeenCalledWith({
        where: {
          userId_postId: { userId: 'user-1', postId: 'post-1' },
        },
      });
    });
  });

  describe('addComment', () => {
    it('should add a comment to post', async () => {
      const mockPost = { id: 'post-1', authorId: 'user-1' };
      const mockComment = {
        id: 'comment-1',
        text: 'Test comment',
        authorId: 'user-1',
        postId: 'post-1',
        createdAt: new Date(),
        author: { id: 'user-1', name: 'Test User', profileImage: null },
      };

      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);
      mockPrismaService.comment.create.mockResolvedValue(mockComment);

      const result = await service.addComment(
        'post-1',
        'user-1',
        'Test comment',
      );

      expect(result.id).toBe('comment-1');
      expect(result.text).toBe('Test comment');
    });

    it('should throw NotFoundException for non-existent post', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(null);

      await expect(
        service.addComment('invalid-post', 'user-1', 'Test comment'),
      ).rejects.toThrow('Post not found');
    });
  });
});
