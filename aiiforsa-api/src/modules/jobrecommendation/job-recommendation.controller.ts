import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JobRecommendationService } from './job-recommendation.service';
import { CreateJobRecommendationDto } from './dto/create-job-recommendation.dto';
import { Roles, Role } from '../../common/decorators/roles.decorator';
import { CurrentUserId } from '../../common/decorators/current-user.decorator';

@ApiTags('job-recommendations')
@ApiBearerAuth('access-token')
@Controller('job-recommendations')
export class JobRecommendationController {
  constructor(
    private readonly jobRecommendationService: JobRecommendationService,
  ) {}

  // Create a new job recommendation
  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new job recommendation (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Job recommendation created successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  create(@Body() createDto: CreateJobRecommendationDto) {
    return this.jobRecommendationService.create(createDto);
  }

  // Search job recommendations by description
  @Get('search')
  @ApiOperation({ summary: 'Search job recommendations by description' })
  @ApiQuery({ name: 'keyword', description: 'Search keyword' })
  @ApiResponse({ status: 200, description: 'Search results' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  search(@Query('keyword') keyword: string) {
    return this.jobRecommendationService.searchByDescription(keyword);
  }

  // Get all ADDED job recommendations for current user
  @Get('me/added')
  @ApiOperation({
    summary: 'Get all ADDED job recommendations for current user',
  })
  @ApiResponse({ status: 200, description: "User's added recommendations" })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMyAdded(@CurrentUserId() userId: string) {
    return this.jobRecommendationService.getAdded(userId);
  }

  // Get all ADDED job recommendations for a specific user
  @Get('added/:userId')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary:
      'Get all ADDED job recommendations for a specific user (Admin only)',
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: "User's added recommendations" })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  getAdded(@Param('userId') userId: string) {
    return this.jobRecommendationService.getAdded(userId);
  }

  // Get all job recommendations
  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all job recommendations (Admin only)' })
  @ApiResponse({ status: 200, description: 'All job recommendations' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  findAll() {
    return this.jobRecommendationService.findAll();
  }

  // Get a single job recommendation by ID
  @Get(':id')
  @ApiOperation({ summary: 'Get job recommendation by ID' })
  @ApiParam({ name: 'id', description: 'Job recommendation ID' })
  @ApiResponse({ status: 200, description: 'Job recommendation details' })
  @ApiResponse({ status: 404, description: 'Job recommendation not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not owner or admin' })
  async findOne(@Param('id') id: string, @CurrentUserId() userId: number) {
    const recommendation = await this.jobRecommendationService.getOne(id);
    // Check if user owns this recommendation or is admin
    if (recommendation.userId !== userId.toString()) {
      throw new Error('Forbidden');
    }
    return recommendation;
  }

  // Update job recommendation status to ADDED
  @Patch(':id')
  @ApiOperation({ summary: 'Update job recommendation status to ADDED' })
  @ApiParam({ name: 'id', description: 'Job recommendation ID' })
  @ApiResponse({
    status: 200,
    description: 'Job recommendation updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Job recommendation not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Not owner or admin' })
  async update(@Param('id') id: string, @CurrentUserId() userId: string) {
    const recommendation = await this.jobRecommendationService.getOne(id);
    // Check if user owns this recommendation or is admin
    if (recommendation.userId !== userId) {
      throw new Error('Forbidden');
    }
    return this.jobRecommendationService.addToList(id);
  }

  // Delete a job recommendation
  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete job recommendation (Admin only)' })
  @ApiParam({ name: 'id', description: 'Job recommendation ID' })
  @ApiResponse({
    status: 204,
    description: 'Job recommendation deleted successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  remove(@Param('id') id: string) {
    return this.jobRecommendationService.remove(id);
  }
}
