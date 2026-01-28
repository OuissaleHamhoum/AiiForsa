import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CurrentUserId } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ACHIEVEMENT_KEYS, TriggerEventResult, XpService } from './xp.service';

class TriggerEventDto {
  key: string;
  meta?: Record<string, any>;
}

class CompleteDailyChallengeDto {
  challengeKey: string;
}

@ApiTags('XP & Achievements')
@Controller('users/me/xp')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class XpController {
  constructor(private readonly xpService: XpService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user XP status' })
  @ApiResponse({ status: 200, description: 'XP status retrieved successfully' })
  async getXpStatus(@CurrentUserId() userId: string) {
    return this.xpService.getXpStatus(userId);
  }

  @Post('events')
  @ApiOperation({ summary: 'Trigger an XP event' })
  @ApiResponse({ status: 200, description: 'Event processed successfully' })
  async triggerEvent(
    @CurrentUserId() userId: string,
    @Body() dto: TriggerEventDto,
  ): Promise<TriggerEventResult> {
    return this.xpService.triggerEvent(userId, dto.key, dto.meta);
  }

  @Post('daily-challenge')
  @ApiOperation({ summary: 'Complete a daily challenge' })
  @ApiResponse({ status: 200, description: 'Daily challenge completed' })
  async completeDailyChallenge(
    @CurrentUserId() userId: string,
    @Body() dto: CompleteDailyChallengeDto,
  ): Promise<TriggerEventResult> {
    return this.xpService.completeDailyChallenge(userId, dto.challengeKey);
  }

  @Post('check-milestones')
  @ApiOperation({ summary: 'Check and award milestone achievements' })
  @ApiResponse({ status: 200, description: 'Milestones checked' })
  async checkMilestones(
    @CurrentUserId() userId: string,
  ): Promise<TriggerEventResult> {
    return this.xpService.checkMilestoneAchievements(userId);
  }

  @Post('achievements/:achievementId/redeem')
  @ApiOperation({ summary: 'Redeem/claim an achievement' })
  @ApiResponse({ status: 200, description: 'Achievement redeemed' })
  async redeemAchievement(
    @CurrentUserId() userId: string,
    @Param('achievementId') achievementId: string,
  ) {
    return this.xpService.redeemAchievement(userId, achievementId);
  }

  @Get('achievements')
  @ApiOperation({
    summary: 'Get all achievement definitions with user progress',
  })
  @ApiResponse({
    status: 200,
    description: 'Achievement definitions with progress retrieved',
  })
  async getAchievementDefinitions(@CurrentUserId() userId: string) {
    return this.xpService.getAchievementDefinitionsWithProgress(userId);
  }

  @Get('badges')
  @ApiOperation({ summary: 'Get all badge definitions' })
  @ApiResponse({ status: 200, description: 'Badge definitions retrieved' })
  getBadgeDefinitions() {
    return this.xpService.getBadgeDefinitions();
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get XP leaderboard' })
  @ApiResponse({ status: 200, description: 'Leaderboard retrieved' })
  async getLeaderboard(@Query('limit') limit?: number) {
    return this.xpService.getLeaderboard(limit || 10);
  }

  @Get('keys')
  @ApiOperation({ summary: 'Get all achievement event keys' })
  @ApiResponse({ status: 200, description: 'Keys retrieved' })
  getEventKeys() {
    return ACHIEVEMENT_KEYS;
  }
}
