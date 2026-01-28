import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

// XP Constants
const XP_PER_LEVEL = 300;

// Achievement event keys
export const ACHIEVEMENT_KEYS = {
  // Daily Challenges (30 XP each, max 90 daily)
  DAILY_SPARK_A: 'DAILY_SPARK_A',
  DAILY_SPARK_B: 'DAILY_SPARK_B',
  DAILY_SPARK_C: 'DAILY_SPARK_C',

  // Career achievements
  APPLICATION_ACE: 'APPLICATION_ACE', // 50 XP for 5 applications
  INTERVIEW_TRAILBLAZER: 'INTERVIEW_TRAILBLAZER', // 50 XP for 5 interviews
  INTERVIEW_INSIGHT: 'INTERVIEW_INSIGHT', // 20 XP per interview for application

  // Community achievements
  THOUGHT_LEADER: 'THOUGHT_LEADER', // 20 XP per post
  COMMUNITY_VOICE: 'COMMUNITY_VOICE', // 5 XP per comment
  CONNECTOR: 'CONNECTOR', // 10 XP for 5 interactions

  // CV/Resume achievements
  RESUME_ARCHIVIST: 'RESUME_ARCHIVIST', // 50 XP per 3 CVs

  // Advice achievements
  ADVISOR: 'ADVISOR', // 50 XP per consultation
  ADVICE_STEP_COMPLETE: 'ADVICE_STEP_COMPLETE', // 10 XP per step

  // Profile achievements
  PROFILE_PIONEER: 'PROFILE_PIONEER', // Profile complete
  LAUNCHPAD: 'LAUNCHPAD', // First project
  PROJECT_BUILDER: 'PROJECT_BUILDER', // 5 projects
  SKILL_COLLECTOR: 'SKILL_COLLECTOR', // 5 skills
  SKILL_MASTER: 'SKILL_MASTER', // 10 skills
  WORK_STARTER: 'WORK_STARTER', // First work experience
  CAREER_CLIMBER: 'CAREER_CLIMBER', // 3 work experiences
} as const;

export type AchievementKey =
  (typeof ACHIEVEMENT_KEYS)[keyof typeof ACHIEVEMENT_KEYS];

export interface TriggerEventResult {
  xp: number;
  level: number;
  xpGained: number;
  leveledUp: boolean;
  newLevel?: number;
  awardedAchievements: Array<{
    id: string;
    key: string;
    title: string;
    xpReward: number;
    icon?: string;
  }>;
  newBadges: Array<{
    id: string;
    name: string;
    level: number;
    icon?: string;
  }>;
}

@Injectable()
export class XpService {
  constructor(private prisma: PrismaService) {}

  /**
   * Trigger an XP event for a user
   */
  async triggerEvent(
    userId: string,
    eventKey: string,
    meta?: Record<string, any>,
  ): Promise<TriggerEventResult> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const oldXp = user.xp;
    const oldLevel = user.level;
    let totalXpGained = 0;
    const awardedAchievements: TriggerEventResult['awardedAchievements'] = [];
    const newBadges: TriggerEventResult['newBadges'] = [];

    // Find the achievement definition
    const achievementDef = await this.prisma.achievementDefinition.findUnique({
      where: { key: eventKey },
    });

    if (achievementDef) {
      // Check if already earned (for non-repeatable)
      const existing = await this.prisma.userAchievement.findUnique({
        where: {
          userId_achievementDefId: {
            userId,
            achievementDefId: achievementDef.id,
          },
        },
      });

      let shouldAward = false;

      if (!existing) {
        // First time earning
        shouldAward = true;
      } else if (achievementDef.repeatable) {
        // Check max repeats
        if (
          !achievementDef.maxRepeats ||
          existing.earnCount < achievementDef.maxRepeats
        ) {
          // Update earn count instead of creating new
          await this.prisma.userAchievement.update({
            where: { id: existing.id },
            data: {
              earnCount: existing.earnCount + 1,
              awardedAt: new Date(),
              claimed: false, // Reset claimed for new earn
            },
          });
          totalXpGained += achievementDef.xpReward;
          awardedAchievements.push({
            id: existing.id,
            key: achievementDef.key,
            title: achievementDef.title,
            xpReward: achievementDef.xpReward,
            icon: achievementDef.icon || undefined,
          });
        }
      }

      if (shouldAward && !existing) {
        const newAchievement = await this.prisma.userAchievement.create({
          data: {
            userId,
            achievementDefId: achievementDef.id,
            meta: meta || undefined,
          },
        });
        totalXpGained += achievementDef.xpReward;
        awardedAchievements.push({
          id: newAchievement.id,
          key: achievementDef.key,
          title: achievementDef.title,
          xpReward: achievementDef.xpReward,
          icon: achievementDef.icon || undefined,
        });
      }
    }

    // Update user XP
    const newXp = oldXp + totalXpGained;
    const newLevel = Math.floor(newXp / XP_PER_LEVEL);
    const leveledUp = newLevel > oldLevel;

    await this.prisma.user.update({
      where: { id: userId },
      data: { xp: newXp, level: newLevel },
    });

    // Award badges for new levels
    if (leveledUp) {
      for (let lvl = oldLevel + 1; lvl <= newLevel; lvl++) {
        const badgeDef = await this.prisma.badgeDefinition.findUnique({
          where: { level: lvl },
        });

        if (badgeDef) {
          const existingBadge = await this.prisma.userBadge.findUnique({
            where: {
              userId_badgeDefId: { userId, badgeDefId: badgeDef.id },
            },
          });

          if (!existingBadge) {
            await this.prisma.userBadge.create({
              data: { userId, badgeDefId: badgeDef.id },
            });
            newBadges.push({
              id: badgeDef.id,
              name: badgeDef.name,
              level: badgeDef.level,
              icon: badgeDef.icon || undefined,
            });
          }
        }
      }
    }

    return {
      xp: newXp,
      level: newLevel,
      xpGained: totalXpGained,
      leveledUp,
      newLevel: leveledUp ? newLevel : undefined,
      awardedAchievements,
      newBadges,
    };
  }

  /**
   * Check and award milestone achievements based on user's current stats
   */
  async checkMilestoneAchievements(
    userId: string,
  ): Promise<TriggerEventResult> {
    const result: TriggerEventResult = {
      xp: 0,
      level: 0,
      xpGained: 0,
      leveledUp: false,
      awardedAchievements: [],
      newBadges: [],
    };

    // Get user stats
    const [
      user,
      applicationCount,
      interviewCount,
      _postCount,
      _commentCount,
      likeCount,
      resumeCount,
      projectCount,
      skillCount,
      experienceCount,
    ] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { xp: true, level: true },
      }),
      this.prisma.jobApplication.count({ where: { userId } }),
      this.prisma.interview.count({ where: { userId } }),
      this.prisma.post.count({ where: { authorId: userId } }),
      this.prisma.comment.count({ where: { authorId: userId } }),
      this.prisma.like.count({ where: { userId } }),
      this.prisma.resume.count({ where: { userId } }),
      this.prisma.userProject.count({ where: { userId } }),
      this.prisma.userSkill.count({ where: { userId } }),
      this.prisma.userWorkExperience.count({ where: { userId } }),
    ]);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const interactionCount = likeCount; // Could add more interaction types

    // Check milestone achievements
    const milestoneChecks = [
      {
        key: ACHIEVEMENT_KEYS.APPLICATION_ACE,
        count: applicationCount,
        threshold: 5,
      },
      {
        key: ACHIEVEMENT_KEYS.INTERVIEW_TRAILBLAZER,
        count: interviewCount,
        threshold: 5,
      },
      {
        key: ACHIEVEMENT_KEYS.CONNECTOR,
        count: interactionCount,
        threshold: 5,
      },
      {
        key: ACHIEVEMENT_KEYS.PROJECT_BUILDER,
        count: projectCount,
        threshold: 5,
      },
      {
        key: ACHIEVEMENT_KEYS.SKILL_COLLECTOR,
        count: skillCount,
        threshold: 5,
      },
      { key: ACHIEVEMENT_KEYS.SKILL_MASTER, count: skillCount, threshold: 10 },
      {
        key: ACHIEVEMENT_KEYS.CAREER_CLIMBER,
        count: experienceCount,
        threshold: 3,
      },
      { key: ACHIEVEMENT_KEYS.LAUNCHPAD, count: projectCount, threshold: 1 },
      {
        key: ACHIEVEMENT_KEYS.WORK_STARTER,
        count: experienceCount,
        threshold: 1,
      },
    ];

    // Check CV milestones (every 3 CVs)
    const cvMilestones = Math.floor(resumeCount / 3);
    if (cvMilestones > 0) {
      for (let i = 0; i < cvMilestones; i++) {
        const eventResult = await this.triggerEvent(
          userId,
          ACHIEVEMENT_KEYS.RESUME_ARCHIVIST,
        );
        result.xpGained += eventResult.xpGained;
        result.awardedAchievements.push(...eventResult.awardedAchievements);
        result.newBadges.push(...eventResult.newBadges);
      }
    }

    for (const check of milestoneChecks) {
      if (check.count >= check.threshold) {
        const eventResult = await this.triggerEvent(userId, check.key);
        result.xpGained += eventResult.xpGained;
        result.awardedAchievements.push(...eventResult.awardedAchievements);
        result.newBadges.push(...eventResult.newBadges);
      }
    }

    // Get updated user data
    const updatedUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true },
    });

    result.xp = updatedUser?.xp || 0;
    result.level = updatedUser?.level || 0;
    result.leveledUp = result.level > user.level;
    if (result.leveledUp) {
      result.newLevel = result.level;
    }

    return result;
  }

  /**
   * Complete a daily challenge
   */
  async completeDailyChallenge(
    userId: string,
    challengeKey: string,
  ): Promise<TriggerEventResult> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the challenge
    const challenge = await this.prisma.dailyChallenge.findFirst({
      where: { key: challengeKey },
    });

    if (!challenge) {
      throw new NotFoundException('Daily challenge not found');
    }

    // Check if already completed today
    const existingCompletion =
      await this.prisma.dailyChallengeCompletion.findUnique({
        where: {
          userId_challengeId_date: {
            userId,
            challengeId: challenge.id,
            date: today,
          },
        },
      });

    if (existingCompletion) {
      throw new BadRequestException('Daily challenge already completed today');
    }

    // Create completion record
    await this.prisma.dailyChallengeCompletion.create({
      data: {
        userId,
        challengeId: challenge.id,
        date: today,
      },
    });

    // Award XP
    return this.triggerEvent(userId, challengeKey);
  }

  /**
   * Get user's XP status
   */
  async getXpStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        xp: true,
        level: true,
        achievements: {
          include: {
            achievementDef: true,
          },
          orderBy: { awardedAt: 'desc' },
        },
        badges: {
          include: {
            badgeDef: true,
          },
          orderBy: { awardedAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const currentLevelXp = user.level * XP_PER_LEVEL;
    const nextLevelXp = (user.level + 1) * XP_PER_LEVEL;
    const progressXp = user.xp - currentLevelXp;
    const progressPercent = (progressXp / XP_PER_LEVEL) * 100;

    // Get today's completed challenges
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysChallenges =
      await this.prisma.dailyChallengeCompletion.findMany({
        where: {
          userId,
          date: today,
        },
        include: {
          challenge: true,
        },
      });

    // Get all daily challenges
    const allDailyChallenges = await this.prisma.dailyChallenge.findMany();

    return {
      xp: user.xp,
      level: user.level,
      currentLevelXp,
      nextLevelXp,
      progressXp,
      progressPercent,
      xpPerLevel: XP_PER_LEVEL,
      displayRange: `${user.xp}/${nextLevelXp} XP`,
      achievements: user.achievements.map((ua) => ({
        id: ua.id,
        key: ua.achievementDef.key,
        title: ua.achievementDef.title,
        description: ua.achievementDef.description,
        xpReward: ua.achievementDef.xpReward,
        icon: ua.achievementDef.icon,
        category: ua.achievementDef.category,
        claimed: ua.claimed,
        claimedAt: ua.claimedAt,
        earnCount: ua.earnCount,
        awardedAt: ua.awardedAt,
      })),
      badges: user.badges.map((ub) => ({
        id: ub.id,
        name: ub.badgeDef.name,
        description: ub.badgeDef.description,
        level: ub.badgeDef.level,
        icon: ub.badgeDef.icon,
        color: ub.badgeDef.color,
        awardedAt: ub.awardedAt,
      })),
      currentBadge:
        user.badges.length > 0
          ? {
              name: user.badges[0].badgeDef.name,
              icon: user.badges[0].badgeDef.icon,
              color: user.badges[0].badgeDef.color,
            }
          : null,
      dailyChallenges: {
        available: allDailyChallenges.map((dc) => ({
          id: dc.id,
          key: dc.key,
          title: dc.title,
          description: dc.description,
          xpReward: dc.xpReward,
          icon: dc.icon,
          completed: todaysChallenges.some((tc) => tc.challengeId === dc.id),
        })),
        completedToday: todaysChallenges.length,
        maxDaily: allDailyChallenges.length,
      },
    };
  }

  /**
   * Redeem/claim an achievement
   */
  async redeemAchievement(userId: string, achievementId: string) {
    const userAchievement = await this.prisma.userAchievement.findFirst({
      where: {
        id: achievementId,
        userId,
      },
      include: {
        achievementDef: true,
      },
    });

    if (!userAchievement) {
      throw new NotFoundException('Achievement not found');
    }

    if (userAchievement.claimed) {
      throw new BadRequestException('Achievement already claimed');
    }

    const updated = await this.prisma.userAchievement.update({
      where: { id: achievementId },
      data: {
        claimed: true,
        claimedAt: new Date(),
      },
      include: {
        achievementDef: true,
      },
    });

    return {
      id: updated.id,
      key: updated.achievementDef.key,
      title: updated.achievementDef.title,
      description: updated.achievementDef.description,
      xpReward: updated.achievementDef.xpReward,
      icon: updated.achievementDef.icon,
      claimed: updated.claimed,
      claimedAt: updated.claimedAt,
    };
  }

  /**
   * Get all achievement definitions (without user context)
   */
  getAchievementDefinitions() {
    return this.prisma.achievementDefinition.findMany({
      orderBy: [{ category: 'asc' }, { xpReward: 'desc' }],
    });
  }

  /**
   * Get all achievement definitions with user progress
   */
  async getAchievementDefinitionsWithProgress(userId: string) {
    // Get all achievement definitions
    const definitions = await this.prisma.achievementDefinition.findMany({
      orderBy: [{ category: 'asc' }, { xpReward: 'desc' }],
    });

    // Get user's achievements
    const userAchievements = await this.prisma.userAchievement.findMany({
      where: { userId },
      include: { achievementDef: true },
    });

    // Get user stats for progress calculation
    const [
      applicationCount,
      interviewCount,
      postCount,
      commentCount,
      likeCount,
      resumeCount,
      projectCount,
      skillCount,
      experienceCount,
    ] = await Promise.all([
      this.prisma.jobApplication.count({ where: { userId } }),
      this.prisma.interview.count({ where: { userId } }),
      this.prisma.post.count({ where: { authorId: userId } }),
      this.prisma.comment.count({ where: { authorId: userId } }),
      this.prisma.like.count({ where: { userId } }),
      this.prisma.resume.count({ where: { userId } }),
      this.prisma.userProject.count({ where: { userId } }),
      this.prisma.userSkill.count({ where: { userId } }),
      this.prisma.userWorkExperience.count({ where: { userId } }),
    ]);

    // Map achievement keys to current progress
    const progressMap: Record<string, { current: number; target: number }> = {
      APPLICATION_ACE: { current: applicationCount, target: 5 },
      INTERVIEW_TRAILBLAZER: { current: interviewCount, target: 5 },
      THOUGHT_LEADER: { current: postCount, target: 1 },
      COMMUNITY_VOICE: { current: commentCount, target: 1 },
      CONNECTOR: { current: likeCount, target: 5 },
      RESUME_ARCHIVIST: { current: resumeCount, target: 3 },
      PROFILE_PIONEER: {
        current: skillCount + experienceCount + projectCount > 0 ? 1 : 0,
        target: 1,
      },
      LAUNCHPAD: { current: projectCount, target: 1 },
      PROJECT_BUILDER: { current: projectCount, target: 5 },
      SKILL_COLLECTOR: { current: skillCount, target: 5 },
      SKILL_MASTER: { current: skillCount, target: 10 },
      WORK_STARTER: { current: experienceCount, target: 1 },
      CAREER_CLIMBER: { current: experienceCount, target: 3 },
    };

    return definitions.map((def) => {
      const userAchievement = userAchievements.find(
        (ua) => ua.achievementDefId === def.id,
      );
      const progress = progressMap[def.key] || {
        current: 0,
        target: def.conditionValue || 1,
      };

      return {
        id: def.id,
        key: def.key,
        title: def.title,
        description: def.description,
        xpReward: def.xpReward,
        icon: def.icon,
        category: def.category,
        conditionType: def.conditionType,
        conditionValue: def.conditionValue,
        repeatable: def.repeatable,
        maxRepeats: def.maxRepeats,
        // User-specific data
        earned: !!userAchievement,
        earnCount: userAchievement?.earnCount || 0,
        claimed: userAchievement?.claimed || false,
        claimedAt: userAchievement?.claimedAt || null,
        awardedAt: userAchievement?.awardedAt || null,
        userAchievementId: userAchievement?.id || null,
        // Progress tracking
        progress: {
          current: Math.min(progress.current, progress.target),
          target: progress.target,
          percent: Math.min(
            100,
            Math.round((progress.current / progress.target) * 100),
          ),
        },
      };
    });
  }

  /**
   * Get all badge definitions
   */
  getBadgeDefinitions() {
    return this.prisma.badgeDefinition.findMany({
      orderBy: { level: 'asc' },
    });
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(limit = 10) {
    const users = await this.prisma.user.findMany({
      where: { isActive: true },
      orderBy: { xp: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        profileImage: true,
        xp: true,
        level: true,
        badges: {
          include: { badgeDef: true },
          orderBy: { awardedAt: 'desc' },
          take: 1,
        },
      },
    });

    return users.map((user, index) => ({
      rank: index + 1,
      id: user.id,
      name: user.name || 'Anonymous',
      profileImage: user.profileImage,
      xp: user.xp,
      level: user.level,
      currentBadge: user.badges[0]?.badgeDef || null,
    }));
  }
}
