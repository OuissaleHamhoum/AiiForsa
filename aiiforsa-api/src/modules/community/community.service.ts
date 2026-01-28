import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ACHIEVEMENT_KEYS, XpService } from '../xp/xp.service';
import { CreatePostDto, UpdatePostDto } from './dto/create-post.dto';

@Injectable()
export class CommunityService {
  constructor(
    private prisma: PrismaService,
    private xpService: XpService,
  ) {}

  // Get posts with pagination and author info
  async getPosts(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              profileImage: true,
              headline: true,
            },
          },
          likes: {
            select: {
              userId: true,
            },
          },
          comments: {
            select: {
              id: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      }),
      this.prisma.post.count(),
    ]);

    return {
      posts: posts.map((post) => ({
        id: post.id,
        caption: post.caption,
        imageUrl: post.imageUrl,
        createdAt: post.createdAt,
        author: post.author,
        likesCount: post._count.likes,
        commentsCount: post._count.comments,
        likes: post.likes, // Include the likes array
        likedByCurrentUser: false, // Will be set by controller
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Create new post
  async createPost(userId: string, data: CreatePostDto) {
    const post = await this.prisma.post.create({
      data: {
        caption: data.caption,
        imageUrl: data.imageUrl,
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            headline: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    // Trigger XP event for creating a post (THOUGHT_LEADER achievement)
    await this.xpService.triggerEvent(userId, ACHIEVEMENT_KEYS.THOUGHT_LEADER);

    return post;
  }

  // Toggle like on post
  async toggleLike(postId: string, userId: string) {
    // Check if like already exists
    const existingLike = await this.prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingLike) {
      // Unlike: remove the like
      await this.prisma.like.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
      return { liked: false };
    } else {
      // Like: create the like
      await this.prisma.like.create({
        data: {
          userId,
          postId,
        },
      });
      return { liked: true };
    }
  }

  // Add comment to post
  async addComment(postId: string, userId: string, text: string) {
    // Verify post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = await this.prisma.comment.create({
      data: {
        text,
        authorId: userId,
        postId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });

    // Trigger XP event for adding a comment (COMMUNITY_VOICE achievement)
    await this.xpService.triggerEvent(userId, ACHIEVEMENT_KEYS.COMMUNITY_VOICE);

    return comment;
  }

  // Get comments for post
  async getComments(postId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    // Verify post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { postId },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
      }),
      this.prisma.comment.count({
        where: { postId },
      }),
    ]);

    return {
      comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Get single post with full details
  async getPostById(postId: string, currentUserId?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
            headline: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                profileImage: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return {
      ...post,
      likedByCurrentUser: currentUserId
        ? post.likes.some((like) => like.userId === currentUserId)
        : false,
    };
  }

  // Update post (only by author)
  async updatePost(postId: string, userId: string, data: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    return this.prisma.post.update({
      where: { id: postId },
      data,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true,
          },
        },
      },
    });
  }

  // Delete post (only by author)
  async deletePost(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.prisma.post.delete({
      where: { id: postId },
    });

    return { message: 'Post deleted successfully' };
  }

  // Get user's posts
  async getUserPosts(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { authorId: userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      }),
      this.prisma.post.count({
        where: { authorId: userId },
      }),
    ]);

    return {
      posts: posts.map((post) => ({
        id: post.id,
        caption: post.caption,
        imageUrl: post.imageUrl,
        createdAt: post.createdAt,
        author: post.author,
        likesCount: post._count.likes,
        commentsCount: post._count.comments,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
