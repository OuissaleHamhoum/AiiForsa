import { Controller, Post, Body, Param, Get, Res } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { InterviewService } from './interview.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { CreateAnswersDto } from './dto/create-answers.dto';
import { CreateRateDto } from './dto/create-rate.dto';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { Roles, Role } from '../../common/decorators/roles.decorator';
import { CurrentUserId } from '../../common/decorators/current-user.decorator';

@ApiTags('interviews')
@ApiBearerAuth('access-token')
@Controller('interviews')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new interview' })
  @ApiResponse({ status: 201, description: 'Interview created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Body() dto: CreateInterviewDto,
    @CurrentUserId() userId: number,
  ) {
    return this.interviewService.create({ ...dto, userId: userId.toString() });
  }

  @Post(':interviewId/questions/:questionId/answer')
  @ApiOperation({ summary: 'Create an answer for a specific question' })
  @ApiParam({ name: 'interviewId', description: 'Interview ID' })
  @ApiParam({ name: 'questionId', description: 'Question ID' })
  @ApiResponse({ status: 201, description: 'Answer created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createAnswer(
    @Param('questionId') questionId: string,
    @Body() dto: CreateAnswerDto,
  ) {
    return this.interviewService.createAnswer(questionId, dto);
  }

  @Post(':interviewId/answers')
  @ApiOperation({ summary: 'Create multiple answers for an interview' })
  @ApiParam({ name: 'interviewId', description: 'Interview ID' })
  @ApiResponse({ status: 201, description: 'Answers created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createAnswersForInterview(
    @Param('interviewId') interviewId: string,
    @Body() dto: CreateAnswersDto,
  ) {
    return this.interviewService.createAnswersForInterview(
      interviewId,
      dto.answers,
    );
  }

  @Post(':interviewId/answers/:answerId/rate')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Rate an answer (Admin only)' })
  @ApiParam({ name: 'interviewId', description: 'Interview ID' })
  @ApiParam({ name: 'answerId', description: 'Answer ID' })
  @ApiResponse({ status: 201, description: 'Rating created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async createRateForAnswer(
    @Param('answerId') answerId: string,
    @Body() dto: CreateRateDto,
  ) {
    return this.interviewService.createRateForAnswer(answerId, dto);
  }

  @Post(':interviewId/rate')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Rate an interview (Admin only)' })
  @ApiParam({ name: 'interviewId', description: 'Interview ID' })
  @ApiResponse({ status: 201, description: 'Rating created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async createRateForInterview(
    @Param('interviewId') interviewId: string,
    @Body() dto: CreateRateDto,
  ) {
    return this.interviewService.createRateForInterview(interviewId, dto);
  }

  @Post(':interviewId/answers/:answerId/feedback')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create feedback for an answer (Admin only)' })
  @ApiParam({ name: 'interviewId', description: 'Interview ID' })
  @ApiParam({ name: 'answerId', description: 'Answer ID' })
  @ApiResponse({ status: 201, description: 'Feedback created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async createFeedbackForAnswer(
    @Param('answerId') answerId: string,
    @Body() dto: CreateFeedbackDto,
  ) {
    return this.interviewService.createFeedbackForAnswer(answerId, dto);
  }

  @Post(':interviewId/feedback')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create feedback for an interview (Admin only)' })
  @ApiParam({ name: 'interviewId', description: 'Interview ID' })
  @ApiResponse({ status: 201, description: 'Feedback created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin only' })
  async createFeedbackForInterview(
    @Param('interviewId') interviewId: string,
    @Body() dto: CreateFeedbackDto,
  ) {
    return this.interviewService.createFeedbackForInterview(interviewId, dto);
  }

  @Get(':interviewId/report')
  @ApiOperation({ summary: 'Get interview report PDF' })
  @ApiParam({ name: 'interviewId', description: 'Interview ID' })
  @ApiResponse({ status: 200, description: 'PDF report generated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getReport(@Param('interviewId') interviewId: string, @Res() res: any) {
    const pdfBuffer =
      await this.interviewService.generateInterviewReport(interviewId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdfBuffer.length,
      'Content-Disposition': `attachment; filename="interview-${interviewId}-report.pdf"`,
    });
    res.send(pdfBuffer);
  }
}
