import {
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    Logger,
    Param,
    Post,
    Put,
    Query,
    Res,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import * as path from 'path';

import { CurrentUserId } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CreateResumeDto } from './dto/create-resume.dto';
import { CreateSectionDto } from './dto/create-section.dto';
import { CreateSuggestionDto } from './dto/create-suggestion.dto';
import { MatchJobDto } from './dto/match-job.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { UpdateSuggestionDto } from './dto/update-suggestion.dto';
import { GradioService } from './gradio.service';
import { ResumeService } from './resume.service';

/**
 * Resume Controller - All resume builder endpoints
 * Includes: CRUD, file upload, AI parsing, review, rewriting, and career advisory
 */
@ApiTags('resume')
@ApiBearerAuth('access-token')
@Controller('resume')
export class ResumeController {
  private readonly logger = new Logger(ResumeController.name);

  constructor(
    private readonly resumeService: ResumeService,
    private readonly gradioService: GradioService,
  ) {}

  // ============================================================================
  // RESUME CRUD
  // ============================================================================

  @Post()
  @ApiOperation({ summary: 'Create a new resume' })
  @ApiResponse({ status: 201, description: 'Resume created' })
  create(@CurrentUserId() userId: string, @Body() dto: CreateResumeDto) {
    return this.resumeService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List my resumes' })
  findAll(@CurrentUserId() userId: string) {
    return this.resumeService.findAllByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a resume by ID' })
  @ApiParam({ name: 'id' })
  findOne(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.resumeService.findOneForUser(userId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update resume data' })
  @ApiParam({ name: 'id' })
  update(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateResumeDto,
  ) {
    return this.resumeService.updateReplaceData(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a resume' })
  @ApiParam({ name: 'id' })
  async remove(@CurrentUserId() userId: string, @Param('id') id: string) {
    try {
      const resume = await this.resumeService.findOneForUser(userId, id);
      if (resume.filePath && fs.existsSync(resume.filePath)) {
        fs.unlinkSync(resume.filePath);
      }
    } catch {
      // ignore file cleanup errors
    }
    return this.resumeService.remove(userId, id);
  }

  // ============================================================================
  // FILE UPLOAD & DOWNLOAD
  // ============================================================================

  @Post(':id/upload')
  @ApiOperation({ summary: 'Upload resume file (PDF/DOC/DOCX)' })
  @ApiParam({ name: 'id' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = path.join(process.cwd(), 'uploads', 'resumes');
          fs.mkdirSync(uploadDir, { recursive: true });
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          const base = path
            .basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9-_]/g, '_');
          cb(null, `${base}_${Date.now()}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowed = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        cb(null, allowed.includes(file.mimetype));
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async upload(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @UploadedFile() file?: any,
  ) {
    if (!file) {
      return { message: 'No file uploaded or unsupported file type' };
    }

    return this.resumeService.attachFile(userId, id, {
      filePath: path.join(file.destination, file.filename),
      fileName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
    });
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download resume file' })
  @ApiParam({ name: 'id' })
  async download(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const resume = await this.resumeService.findOneForUser(userId, id);
    if (!resume.filePath || !fs.existsSync(resume.filePath)) {
      return res.status(404).json({ message: 'No file attached' });
    }
    res.setHeader(
      'Content-Type',
      resume.mimeType || 'application/octet-stream',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${resume.fileName || path.basename(resume.filePath)}"`,
    );
    fs.createReadStream(resume.filePath).pipe(res);
  }

  // ============================================================================
  // AI PARSING - Extract structured data from uploaded files
  // ============================================================================

  @Post('parse/gemini')
  @ApiOperation({ summary: 'Parse resume using Google Gemini' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async parseWithGemini(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { message: 'No file provided' };
    }
    return this.gradioService.parseResumeGemini(file.buffer, file.originalname);
  }

  @Post('parse/qwen')
  @ApiOperation({ summary: 'Parse resume using Qwen Vision' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async parseWithQwen(@UploadedFile() file: Express.Multer.File) {
    console.log(!!file);
    console.log('File details:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    if (!file) {
      throw new ForbiddenException('No file provided');
    }
    return this.gradioService.parseResumeQwen(file.buffer, file.originalname);
  }

  // ============================================================================
  // AI REVIEW - ATS scoring and feedback
  // ============================================================================

  @Post(':id/review')
  @ApiOperation({ summary: 'Review resume with ATS scoring' })
  @ApiParam({ name: 'id' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        temperature: { type: 'number', default: 0.7 },
        maxTokens: { type: 'number', default: 2048 },
      },
    },
  })
  async review(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body('temperature') temperature?: number,
    @Body('maxTokens') maxTokens?: number,
  ) {
    const resume = await this.resumeService.findOneForUser(userId, id);
    const result = await this.gradioService.reviewResume(resume.data, {
      temperature,
      maxTokens,
    });

    // Update AI score
    await this.resumeService.updateMetadata(userId, id, {
      lastReviewedAt: new Date(),
    });

    return result;
  }

  @Post(':id/review-multilingual')
  @ApiOperation({ summary: 'Review resume in multiple languages' })
  @ApiParam({ name: 'id' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        temperature: { type: 'number', default: 0.7 },
        maxTokens: { type: 'number', default: 2048 },
      },
    },
  })
  async reviewMultilingual(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body('temperature') temperature?: number,
    @Body('maxTokens') maxTokens?: number,
  ) {
    const resume = await this.resumeService.findOneForUser(userId, id);
    return this.gradioService.reviewResumeMultilingual(resume.data, {
      temperature,
      maxTokens,
    });
  }

  // ============================================================================
  // AI REWRITING - Improvements and suggestions
  // ============================================================================

  @Post(':id/rewrite')
  @ApiOperation({ summary: 'Rewrite/enhance resume with AI' })
  @ApiParam({ name: 'id' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        temperature: { type: 'number', default: 0.7 },
        maxTokens: { type: 'number', default: 8192 },
      },
    },
  })
  async rewrite(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body('temperature') temperature?: number,
    @Body('maxTokens') maxTokens?: number,
  ) {
    const resume = await this.resumeService.findOneForUser(userId, id);
    return this.gradioService.rewriteResume(resume.data, {
      temperature,
      maxTokens,
    });
  }

  // ============================================================================
  // CAREER ADVISOR - Personalized guidance
  // ============================================================================

  @Post(':id/career-advice')
  @ApiOperation({ summary: 'Get career advice based on resume' })
  @ApiParam({ name: 'id' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        desiredPaths: {
          type: 'array',
          items: { type: 'string' },
          example: ['Data Science', 'AI/ML Engineer'],
        },
        intentions: {
          type: 'string',
          example: 'I want to transition to AI/ML roles',
        },
        temperature: { type: 'number', default: 0.7 },
        maxTokens: { type: 'number', default: 8192 },
      },
    },
  })
  async getCareerAdvice(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body('desiredPaths') desiredPaths: string[],
    @Body('intentions') intentions: string,
    @Body('temperature') temperature?: number,
    @Body('maxTokens') maxTokens?: number,
  ) {
    const resume = await this.resumeService.findOneForUser(userId, id);
    const result = await this.gradioService.getCareerAdvice(
      resume.data,
      desiredPaths || [],
      intentions || '',
      { temperature, maxTokens },
    );

    // Save career advice to resume
    await this.resumeService.updateMetadata(userId, id, {
      careerAdvice: result.advice,
    });

    return result;
  }

  @Post(':id/career-advice/feedback')
  @ApiOperation({ summary: 'Apply feedback to career advice' })
  @ApiParam({ name: 'id' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        originalOutput: { type: 'string' },
        stepIdentifier: { type: 'string' },
        feedback: { type: 'object' },
        temperature: { type: 'number', default: 0.7 },
        maxTokens: { type: 'number', default: 8192 },
      },
    },
  })
  async applyCareerFeedback(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body('originalOutput') originalOutput: string,
    @Body('stepIdentifier') stepIdentifier: string,
    @Body('feedback') feedback: any,
    @Body('temperature') temperature?: number,
    @Body('maxTokens') maxTokens?: number,
  ) {
    await this.resumeService.findOneForUser(userId, id); // Verify ownership
    return this.gradioService.applyCareerFeedback(
      originalOutput,
      stepIdentifier,
      feedback,
      { temperature, maxTokens },
    );
  }

  // ============================================================================
  // SECTION MANAGEMENT
  // ============================================================================

  @Post(':id/sections')
  @ApiOperation({ summary: 'Add section to resume' })
  @ApiParam({ name: 'id' })
  createSection(
    @CurrentUserId() userId: string,
    @Param('id') resumeId: string,
    @Body() dto: CreateSectionDto,
  ) {
    return this.resumeService.createSection(userId, resumeId, dto);
  }

  @Get(':id/sections')
  @ApiOperation({ summary: 'Get all sections' })
  @ApiParam({ name: 'id' })
  getSections(@CurrentUserId() userId: string, @Param('id') resumeId: string) {
    return this.resumeService.getSections(userId, resumeId);
  }

  @Get('sections/:sectionId')
  @ApiOperation({ summary: 'Get specific section' })
  @ApiParam({ name: 'sectionId' })
  getSection(
    @CurrentUserId() userId: string,
    @Param('sectionId') sectionId: string,
  ) {
    return this.resumeService.getSection(userId, sectionId);
  }

  @Put('sections/:sectionId')
  @ApiOperation({ summary: 'Update section' })
  @ApiParam({ name: 'sectionId' })
  updateSection(
    @CurrentUserId() userId: string,
    @Param('sectionId') sectionId: string,
    @Body() dto: UpdateSectionDto,
  ) {
    return this.resumeService.updateSection(userId, sectionId, dto);
  }

  @Delete('sections/:sectionId')
  @ApiOperation({ summary: 'Delete section' })
  @ApiParam({ name: 'sectionId' })
  deleteSection(
    @CurrentUserId() userId: string,
    @Param('sectionId') sectionId: string,
  ) {
    return this.resumeService.deleteSection(userId, sectionId);
  }

  @Put(':id/sections/reorder')
  @ApiOperation({ summary: 'Reorder sections' })
  @ApiParam({ name: 'id' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        sectionOrders: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              order: { type: 'number' },
            },
          },
        },
      },
    },
  })
  reorderSections(
    @CurrentUserId() userId: string,
    @Param('id') resumeId: string,
    @Body('sectionOrders') sectionOrders: { id: string; order: number }[],
  ) {
    return this.resumeService.reorderSections(userId, resumeId, sectionOrders);
  }

  // ============================================================================
  // SUGGESTION MANAGEMENT
  // ============================================================================

  @Post(':id/suggestions')
  @ApiOperation({ summary: 'Create suggestion' })
  @ApiParam({ name: 'id' })
  createSuggestion(
    @CurrentUserId() userId: string,
    @Param('id') resumeId: string,
    @Body() dto: CreateSuggestionDto,
  ) {
    return this.resumeService.createSuggestion(userId, resumeId, dto);
  }

  @Get(':id/suggestions')
  @ApiOperation({ summary: 'Get suggestions' })
  @ApiParam({ name: 'id' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'sectionId', required: false })
  getSuggestions(
    @CurrentUserId() userId: string,
    @Param('id') resumeId: string,
    @Query('status') status?: string,
    @Query('sectionId') sectionId?: string,
  ) {
    return this.resumeService.getSuggestions(
      userId,
      resumeId,
      status,
      sectionId,
    );
  }

  @Put('suggestions/:suggestionId')
  @ApiOperation({ summary: 'Update suggestion status' })
  @ApiParam({ name: 'suggestionId' })
  updateSuggestion(
    @CurrentUserId() userId: string,
    @Param('suggestionId') suggestionId: string,
    @Body() dto: UpdateSuggestionDto,
  ) {
    return this.resumeService.updateSuggestion(userId, suggestionId, dto);
  }

  @Delete('suggestions/:suggestionId')
  @ApiOperation({ summary: 'Delete suggestion' })
  @ApiParam({ name: 'suggestionId' })
  deleteSuggestion(
    @CurrentUserId() userId: string,
    @Param('suggestionId') suggestionId: string,
  ) {
    return this.resumeService.deleteSuggestion(userId, suggestionId);
  }

  // ============================================================================
  // RESUME SHARING
  // ============================================================================

  @Post(':id/share')
  @ApiOperation({ summary: 'Generate shareable public link for resume' })
  @ApiParam({ name: 'id' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        expiry: { type: 'string', format: 'date-time', nullable: true },
      },
    },
  })
  generateShareLink(
    @CurrentUserId() userId: string,
    @Param('id') id: string,
    @Body('expiry') expiry?: string,
  ) {
    return this.resumeService.generateShareLink(userId, id, {
      expiry: expiry ? new Date(expiry) : undefined,
    });
  }

  @Delete(':id/share')
  @ApiOperation({ summary: 'Revoke shareable link' })
  @ApiParam({ name: 'id' })
  revokeShareLink(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.resumeService.revokeShareLink(userId, id);
  }

  @Get(':id/share/stats')
  @ApiOperation({ summary: 'Get share statistics' })
  @ApiParam({ name: 'id' })
  getShareStats(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.resumeService.getShareStats(userId, id);
  }

  // ============================================================================
  // JOB MATCHING
  // ============================================================================

  @Post('match-job')
  @ApiOperation({ summary: 'Match resume with job requirements using AI' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        resumeData: { type: 'object', description: 'Resume data as JSON' },
        jobTitle: { type: 'string' },
        jobRequirements: { type: 'string' },
        jobDescription: { type: 'string', nullable: true },
        githubUrl: { type: 'string', nullable: true },
        linkedinUrl: { type: 'string', nullable: true },
      },
      required: ['resumeData', 'jobTitle', 'jobRequirements'],
    },
  })
  async matchJob(@CurrentUserId() userId: string, @Body() dto: MatchJobDto) {
    return this.gradioService.matchJobWithCV(
      dto.resumeData,
      {
        jobTitle: dto.jobTitle,
        jobRequirements: dto.jobRequirements,
        jobDescription: dto.jobDescription,
        githubUrl: dto.githubUrl,
        linkedinUrl: dto.linkedinUrl,
      },
      userId,
    );
  }

  // ============================================================================
  // PUBLIC ENDPOINTS (NO AUTH REQUIRED)
  // ============================================================================

  @Public()
  @Get('share/:slug')
  @ApiOperation({ summary: 'Get publicly shared resume (no auth required)' })
  @ApiParam({ name: 'slug' })
  async getSharedResume(@Param('slug') slug: string) {
    return this.resumeService.getByShareSlug(slug);
  }

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  @Get('health/gradio')
  @ApiOperation({ summary: 'Check Gradio service health' })
  async healthCheck() {
    return this.gradioService.healthCheck();
  }
}
