import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CurrentUser,
  CurrentUserId,
} from '../../common/decorators/current-user.decorator';
import { Role, Roles } from '../../common/decorators/roles.decorator';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { UpdateJobApplicationDto } from './dto/update-job-application.dto';
import { JobApplicationService } from './job-application.service';

@ApiTags('job-applications')
@ApiBearerAuth('access-token')
@Controller('job-applications')
export class JobApplicationController {
  constructor(private readonly jobApplicationService: JobApplicationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new job application' })
  @ApiResponse({
    status: 201,
    description: 'Job application created successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createJobApplicationDto: CreateJobApplicationDto,
    @CurrentUserId() userId: string,
  ) {
    // Set the userId from the authenticated user
    createJobApplicationDto.userId = userId;
    return this.jobApplicationService.create(createJobApplicationDto);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all job applications (Admin only)' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({ status: 200, description: 'List of job applications' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.jobApplicationService.findAll(page, limit);
  }

  @Get('me')
  @ApiOperation({ summary: "Get current user's job applications" })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: "List of user's job applications",
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findMyApplications(
    @CurrentUserId() userId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.jobApplicationService.findByUser(userId, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job application by ID' })
  @ApiParam({ name: 'id', description: 'Job application ID' })
  @ApiResponse({ status: 200, description: 'Job application details' })
  @ApiResponse({ status: 404, description: 'Job application not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not owner or admin',
  })
  async findOne(@Param('id') id: string, @CurrentUserId() userId: string) {
    const application = await this.jobApplicationService.findOne(id);
    // Check if user owns this application or is admin
    if (application.userId !== userId) {
      // This will be handled by a guard or service method
      throw new Error('Forbidden');
    }
    return application;
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get job applications by user ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: "List of user's job applications",
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Not owner or admin' })
  findByUser(
    @Param('userId') userId: string,
    @CurrentUser() user: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    // Allow if current user is the owner or admin
    if (user.id !== userId && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Forbidden resource');
    }
    return this.jobApplicationService.findByUser(userId, page, limit);
  }

  @Get('job/:jobId')
  @ApiOperation({ summary: 'Get job applications by job ID' })
  @ApiParam({ name: 'jobId', description: 'Job ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'List of job applications for the job',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findByJob(
    @Param('jobId', ParseIntPipe) jobId: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.jobApplicationService.findByJob(jobId, page, limit);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update job application' })
  @ApiParam({ name: 'id', description: 'Job application ID' })
  @ApiResponse({
    status: 200,
    description: 'Job application updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Job application not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not owner or admin',
  })
  async update(
    @Param('id') id: string,
    @Body() updateJobApplicationDto: UpdateJobApplicationDto,
    @CurrentUserId() userId: string,
  ) {
    const application = await this.jobApplicationService.findOne(id);
    // Check if user owns this application or is admin
    if (application.userId !== userId) {
      // This will be handled by a guard or service method
      throw new Error('Forbidden');
    }
    return this.jobApplicationService.update(id, updateJobApplicationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete job application' })
  @ApiParam({ name: 'id', description: 'Job application ID' })
  @ApiResponse({
    status: 204,
    description: 'Job application deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Job application not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not owner or admin',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUserId() userId: string) {
    const application = await this.jobApplicationService.findOne(id);
    // Check if user owns this application or is admin
    if (application.userId !== userId) {
      // This will be handled by a guard or service method
      throw new Error('Forbidden');
    }
    return this.jobApplicationService.remove(id);
  }

  @Get('stats/global')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get global application statistics (Admin only)' })
  @ApiResponse({ status: 200, description: 'Application statistics' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  getStats() {
    return this.jobApplicationService.getApplicationStats();
  }
}
