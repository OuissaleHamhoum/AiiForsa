import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CommunityService } from './community.service';
import {
  CreateCommentDto,
  CreatePostDto,
  PaginationQueryDto,
  UpdatePostDto,
} from './dto/create-post.dto';

@Controller('community')
@UseGuards(JwtAuthGuard)
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get('posts')
  async getPosts(@Query() query: PaginationQueryDto, @Request() req: any) {
    const result = await this.communityService.getPosts(
      query.page || 1,
      query.limit || 10,
    );

    // Add likedByCurrentUser flag for each post
    const userId = req.user?.id;
    if (userId) {
      result.posts = result.posts.map((post) => ({
        ...post,
        likedByCurrentUser: post.likes.some((like) => like.userId === userId),
      }));
    }

    return result;
  }

  @Post('posts')
  @HttpCode(HttpStatus.CREATED)
  async createPost(@Body() createPostDto: CreatePostDto, @Request() req: any) {
    return this.communityService.createPost(req.user.id, createPostDto);
  }

  @Get('posts/:id')
  async getPostById(@Param('id') postId: string, @Request() req: any) {
    return this.communityService.getPostById(postId, req.user?.id);
  }

  @Put('posts/:id')
  async updatePost(
    @Param('id') postId: string,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req: any,
  ) {
    return this.communityService.updatePost(postId, req.user.id, updatePostDto);
  }

  @Delete('posts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') postId: string, @Request() req: any) {
    return this.communityService.deletePost(postId, req.user.id);
  }

  @Post('posts/:id/like')
  async toggleLike(@Param('id') postId: string, @Request() req: any) {
    return this.communityService.toggleLike(postId, req.user.id);
  }

  @Post('posts/:id/comments')
  @HttpCode(HttpStatus.CREATED)
  async addComment(
    @Param('id') postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Request() req: any,
  ) {
    return this.communityService.addComment(
      postId,
      req.user.id,
      createCommentDto.text,
    );
  }

  @Get('posts/:id/comments')
  async getComments(
    @Param('id') postId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.communityService.getComments(
      postId,
      query.page || 1,
      query.limit || 20,
    );
  }

  @Get('users/:userId/posts')
  async getUserPosts(
    @Param('userId') userId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.communityService.getUserPosts(
      userId,
      query.page || 1,
      query.limit || 10,
    );
  }
}
