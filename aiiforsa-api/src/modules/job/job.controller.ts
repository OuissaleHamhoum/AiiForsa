import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Role, Roles } from '../../common/decorators/roles.decorator';
import { AdzunaService } from './adzuna.service';
import { CreateJobDto } from './dto/createjob.dto';
import { UpdateJobDto } from './dto/updatejob.dto';
import { JobDatabaseService } from './job-database.service';
import { JobService } from './job.service';

@ApiTags('jobs')
@ApiBearerAuth('access-token')
@Controller('jobs')
export class JobController {
  constructor(
    private jobService0: JobService,
    private adzunaService: AdzunaService,
    private jobDatabaseService: JobDatabaseService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new job' })
  @ApiResponse({ status: 201, description: 'Job created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createJobDto: CreateJobDto) {
    return this.jobService0.create(createJobDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all jobs' })
  @ApiResponse({ status: 200, description: 'List of jobs' })
  findAll() {
    return this.jobService0.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job by ID' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: 200, description: 'Job details' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  findOne(@Param('id') id: string) {
    return this.jobService0.findOne(Number(id));
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update job (Admin only)' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: 200, description: 'Job updated successfully' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobService0.update(Number(id), updateJobDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete job (Admin only)' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: 200, description: 'Job deleted successfully' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  remove(@Param('id') id: string) {
    return this.jobService0.remove(Number(id));
  }

  @Post('sync-adzuna')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Sync jobs from Adzuna API (Admin only)' })
  @ApiResponse({ status: 200, description: 'Jobs synced successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  syncAdzunaJobs(
    @Body() params?: { what?: string; where?: string; maxResults?: number },
  ) {
    return this.adzunaService.fetchAndStoreJobs(params || {});
  }

  @Post('sync-to-database')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Sync jobs from SQL database to vector database (Admin only)' })
  @ApiResponse({ status: 200, description: 'Jobs synced to database successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  syncJobsToDatabase() {
    return this.jobService0.syncJobsToDatabase();
  }

  // Job Database Integration Endpoints
  @Post('database/add')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Add job to vector database (Admin only)' })
  @ApiResponse({ status: 201, description: 'Job added to database successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async addToJobDatabase(@Body() jobData: any) {
    return this.jobDatabaseService.addJob(jobData);
  }

  @Post('database/match-cv')
  @ApiOperation({ summary: 'Match CV with jobs in vector database' })
  @ApiResponse({ status: 200, description: 'Matching results' })
  async matchCVWithJobs(
    @Body() body: { cvText: string; nResults?: number },
  ) {
    const { cvText, nResults = 5 } = body;
    return this.jobDatabaseService.matchCVWithJobs(cvText, nResults);
  }

  @Get('database/all')
  @ApiOperation({ summary: 'Get all jobs from vector database' })
  @ApiResponse({ status: 200, description: 'List of jobs from database' })
  async getAllJobsFromDatabase() {
    return this.jobDatabaseService.getAllJobs();
  }

  @Delete('database/:id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete job from vector database (Admin only)' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: 200, description: 'Job deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async deleteFromJobDatabase(@Param('id') id: string) {
    return this.jobDatabaseService.deleteJob(id);
  }
}
