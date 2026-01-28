import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Query,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CurrentUserId } from '../../common/decorators/current-user.decorator';
import { StartVoiceInterviewDto } from './dto/start-voice-interview.dto';
import {
    VoiceInterviewHistoryResponseDto,
    VoiceInterviewReportResponseDto,
    VoiceInterviewSessionResponseDto,
} from './dto/voice-interview-response.dto';
import { VoiceInterviewService } from './voice-interview.service';

@ApiTags('voice-interviews')
@ApiBearerAuth('access-token')
@Controller('voice-interviews')
export class VoiceInterviewController {
  constructor(private readonly voiceInterviewService: VoiceInterviewService) {}

  /**
   * Setup and start a voice interview session
   * This writes the CV and job description to files for the Python voice interview system
   */
  @Post('setup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Setup and start a voice interview session' })
  @ApiResponse({
    status: 200,
    description: 'Voice interview session created successfully',
    type: VoiceInterviewSessionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async setupVoiceInterview(
    @Body() dto: StartVoiceInterviewDto,
    @CurrentUserId() userId: string,
  ): Promise<VoiceInterviewSessionResponseDto> {
    return this.voiceInterviewService.setupVoiceInterview(dto, userId);
  }

  /**
   * Get the voice interview report after completion
   */
  @Get('report')
  @ApiOperation({ summary: 'Get voice interview report' })
  @ApiQuery({
    name: 'sessionId',
    required: false,
    description: 'Session ID (optional, uses latest if not provided)',
  })
  @ApiResponse({
    status: 200,
    description: 'Voice interview report retrieved successfully',
    type: VoiceInterviewReportResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Report not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getReport(
    @Query('sessionId') sessionId?: string,
    @CurrentUserId() userId?: string,
  ): Promise<VoiceInterviewReportResponseDto> {
    return this.voiceInterviewService.getVoiceInterviewReport(
      sessionId,
      userId,
    );
  }

  /**
   * Get the conversation history from a voice interview
   */
  @Get('history')
  @ApiOperation({ summary: 'Get voice interview conversation history' })
  @ApiQuery({
    name: 'sessionId',
    required: false,
    description: 'Session ID (optional, uses latest if not provided)',
  })
  @ApiResponse({
    status: 200,
    description: 'Voice interview history retrieved successfully',
    type: VoiceInterviewHistoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'History not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getHistory(
    @Query('sessionId') sessionId?: string,
    @CurrentUserId() userId?: string,
  ): Promise<VoiceInterviewHistoryResponseDto> {
    return this.voiceInterviewService.getVoiceInterviewHistory(
      sessionId,
      userId,
    );
  }

  /**
   * Get the WebRTC stream URL for the voice interview
   */
  @Get('stream-url')
  @ApiOperation({ summary: 'Get WebRTC stream URL for voice interview' })
  @ApiResponse({
    status: 200,
    description: 'Stream URL retrieved',
  })
  getStreamUrl(): { streamUrl: string } {
    return this.voiceInterviewService.getStreamUrl();
  }
}
