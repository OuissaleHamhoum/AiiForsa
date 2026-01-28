import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for voice interview session creation
 */
export class VoiceInterviewSessionResponseDto {
  @ApiProperty({
    example: 'session-123-abc',
    description: 'Unique session identifier',
  })
  sessionId: string;

  @ApiProperty({
    example: 'http://localhost:7861',
    description: 'WebRTC stream URL for the voice interview',
  })
  streamUrl: string;

  @ApiProperty({
    example: 'active',
    description: 'Session status',
    enum: ['active', 'completed', 'pending'],
  })
  status: 'active' | 'completed' | 'pending';

  @ApiProperty({
    example: '2025-12-12T10:00:00Z',
    description: 'Session creation timestamp',
  })
  createdAt: string;
}

/**
 * Evaluation section in the interview report
 */
export class EvaluationSectionDto {
  @ApiProperty({ example: 'HR Section' })
  section: string;

  @ApiProperty({ example: 8 })
  score: number;

  @ApiProperty({ example: 'Good communication skills' })
  strength: string;

  @ApiProperty({ example: 'Could be more specific' })
  weaknesses: string;

  @ApiProperty({ example: 'Candidate showed good potential' })
  general_overview: string;
}

/**
 * Response DTO for voice interview report
 */
export class VoiceInterviewReportResponseDto {
  @ApiProperty({
    example: 'session-123-abc',
    description: 'Session identifier',
  })
  sessionId: string;

  @ApiProperty({
    type: [EvaluationSectionDto],
    description: 'Evaluation by section',
  })
  evaluation: EvaluationSectionDto[];

  @ApiProperty({
    example: 75,
    description: 'Overall score out of 100',
  })
  overallScore: number;

  @ApiProperty({
    example: 'completed',
    description: 'Interview completion status',
  })
  status: string;

  @ApiProperty({
    example: '2025-12-12T10:30:00Z',
    description: 'Report generation timestamp',
  })
  generatedAt: string;
}

/**
 * Conversation entry in the history
 */
export class ConversationEntryDto {
  @ApiProperty({ example: 'HR Section' })
  section: string;

  @ApiProperty({ example: 'User said' })
  role: string;

  @ApiProperty({
    example: 'I have 5 years of experience in software development',
  })
  content: string;
}

/**
 * Response DTO for voice interview history
 */
export class VoiceInterviewHistoryResponseDto {
  @ApiProperty({
    example: 'session-123-abc',
    description: 'Session identifier',
  })
  sessionId: string;

  @ApiProperty({
    type: [ConversationEntryDto],
    description: 'Conversation history',
  })
  history: ConversationEntryDto[];

  @ApiProperty({
    example: 15,
    description: 'Total number of exchanges',
  })
  totalExchanges: number;
}
