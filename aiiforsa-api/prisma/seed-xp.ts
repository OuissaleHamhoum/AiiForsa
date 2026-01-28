import {
    AchievementCategory,
    AchievementConditionType,
    PrismaClient,
} from '@prisma/client';

const prisma = new PrismaClient();

// Achievement definitions with creative names
const achievementDefinitions = [
  // ===== DAILY CHALLENGES (30 XP each) =====
  {
    key: 'DAILY_SPARK_A',
    title: 'Morning Momentum',
    description: 'Complete your first daily challenge of the day',
    xpReward: 30,
    icon: '🌅',
    category: AchievementCategory.DAILY,
    repeatable: true,
  },
  {
    key: 'DAILY_SPARK_B',
    title: 'Midday Maven',
    description: 'Stay productive with your second daily challenge',
    xpReward: 30,
    icon: '☀️',
    category: AchievementCategory.DAILY,
    repeatable: true,
  },
  {
    key: 'DAILY_SPARK_C',
    title: 'Evening Excellence',
    description: 'Close out the day with your third challenge',
    xpReward: 30,
    icon: '🌙',
    category: AchievementCategory.DAILY,
    repeatable: true,
  },

  // ===== CAREER ACHIEVEMENTS =====
  {
    key: 'APPLICATION_ACE',
    title: 'Application Ace',
    description: "Submit 5 job applications - you're on fire!",
    xpReward: 50,
    icon: '🎯',
    category: AchievementCategory.CAREER,
    repeatable: false,
    conditionType: AchievementConditionType.APPLICATION_COUNT,
    conditionValue: 5,
  },
  {
    key: 'INTERVIEW_TRAILBLAZER',
    title: 'Interview Trailblazer',
    description: "Land 5 interviews - you're making waves!",
    xpReward: 50,
    icon: '🚀',
    category: AchievementCategory.CAREER,
    repeatable: false,
    conditionType: AchievementConditionType.INTERVIEW_COUNT,
    conditionValue: 5,
  },
  {
    key: 'INTERVIEW_INSIGHT',
    title: 'Interview Insight',
    description: 'Complete an interview for your application',
    xpReward: 20,
    icon: '💡',
    category: AchievementCategory.CAREER,
    repeatable: true,
  },

  // ===== COMMUNITY ACHIEVEMENTS =====
  {
    key: 'THOUGHT_LEADER',
    title: 'Thought Leader',
    description: 'Share your wisdom by publishing a post',
    xpReward: 20,
    icon: '📝',
    category: AchievementCategory.COMMUNITY,
    repeatable: true,
  },
  {
    key: 'COMMUNITY_VOICE',
    title: 'Community Voice',
    description: 'Engage with the community by leaving a comment',
    xpReward: 5,
    icon: '💬',
    category: AchievementCategory.COMMUNITY,
    repeatable: true,
  },
  {
    key: 'CONNECTOR',
    title: 'Social Butterfly',
    description: "Make 5 interactions - you're building connections!",
    xpReward: 10,
    icon: '🦋',
    category: AchievementCategory.COMMUNITY,
    repeatable: false,
    conditionType: AchievementConditionType.INTERACTION_COUNT,
    conditionValue: 5,
  },

  // ===== CV/RESUME ACHIEVEMENTS =====
  {
    key: 'RESUME_ARCHIVIST',
    title: 'Resume Archivist',
    description: 'Create 3 different CVs - variety is key!',
    xpReward: 50,
    icon: '📚',
    category: AchievementCategory.CV,
    repeatable: true,
    maxRepeats: 10,
    conditionType: AchievementConditionType.CV_COUNT,
    conditionValue: 3,
  },

  // ===== ADVICE/CONSULTATION ACHIEVEMENTS =====
  {
    key: 'ADVISOR',
    title: 'Career Navigator',
    description: 'Complete a career advice consultation session',
    xpReward: 50,
    icon: '🧭',
    category: AchievementCategory.MILESTONE,
    repeatable: true,
  },
  {
    key: 'ADVICE_STEP_COMPLETE',
    title: 'Step Master',
    description: 'Complete an individual advice step',
    xpReward: 10,
    icon: '👣',
    category: AchievementCategory.MILESTONE,
    repeatable: true,
  },

  // ===== PROFILE ACHIEVEMENTS =====
  {
    key: 'PROFILE_PIONEER',
    title: 'Profile Pioneer',
    description: 'Complete your profile setup - first impressions matter!',
    xpReward: 50,
    icon: '🏆',
    category: AchievementCategory.PROFILE,
    repeatable: false,
    conditionType: AchievementConditionType.PROFILE_COMPLETE,
    conditionValue: 100,
  },
  {
    key: 'LAUNCHPAD',
    title: 'Launchpad',
    description: 'Add your first project to showcase your work',
    xpReward: 30,
    icon: '🎪',
    category: AchievementCategory.PROFILE,
    repeatable: false,
    conditionType: AchievementConditionType.PROJECT_COUNT,
    conditionValue: 1,
  },
  {
    key: 'PROJECT_BUILDER',
    title: 'Project Builder',
    description: 'Showcase 5 projects - impressive portfolio!',
    xpReward: 100,
    icon: '🏗️',
    category: AchievementCategory.PROFILE,
    repeatable: false,
    conditionType: AchievementConditionType.PROJECT_COUNT,
    conditionValue: 5,
  },
  {
    key: 'SKILL_COLLECTOR',
    title: 'Skill Collector',
    description: 'Add 5 skills to your profile',
    xpReward: 30,
    icon: '🎨',
    category: AchievementCategory.PROFILE,
    repeatable: false,
    conditionType: AchievementConditionType.SKILL_COUNT,
    conditionValue: 5,
  },
  {
    key: 'SKILL_MASTER',
    title: 'Skill Master',
    description: "Master 10 skills - you're a multi-talented pro!",
    xpReward: 70,
    icon: '🎓',
    category: AchievementCategory.PROFILE,
    repeatable: false,
    conditionType: AchievementConditionType.SKILL_COUNT,
    conditionValue: 10,
  },
  {
    key: 'WORK_STARTER',
    title: 'Work Starter',
    description: 'Add your first work experience',
    xpReward: 20,
    icon: '💼',
    category: AchievementCategory.PROFILE,
    repeatable: false,
    conditionType: AchievementConditionType.EXPERIENCE_COUNT,
    conditionValue: 1,
  },
  {
    key: 'CAREER_CLIMBER',
    title: 'Career Climber',
    description: "Document 3 work experiences - you're climbing the ladder!",
    xpReward: 80,
    icon: '📈',
    category: AchievementCategory.PROFILE,
    repeatable: false,
    conditionType: AchievementConditionType.EXPERIENCE_COUNT,
    conditionValue: 3,
  },
];

// Badge definitions (level-based)
const badgeDefinitions = [
  {
    level: 1,
    name: 'Bronze Explorer',
    description: "You've taken your first steps on the journey!",
    icon: '🥉',
    color: '#CD7F32',
  },
  {
    level: 2,
    name: 'Silver Seeker',
    description: 'Your dedication is paying off!',
    icon: '🥈',
    color: '#C0C0C0',
  },
  {
    level: 3,
    name: 'Gold Achiever',
    description: "You're shining bright with your accomplishments!",
    icon: '🥇',
    color: '#FFD700',
  },
  {
    level: 4,
    name: 'Platinum Pioneer',
    description: 'A true trailblazer in the making!',
    icon: '💎',
    color: '#E5E4E2',
  },
  {
    level: 5,
    name: 'Diamond Champion',
    description: 'Your commitment is crystal clear!',
    icon: '💠',
    color: '#B9F2FF',
  },
  {
    level: 6,
    name: 'Ruby Rising Star',
    description: "You're on fire with passion and progress!",
    icon: '❤️',
    color: '#E0115F',
  },
  {
    level: 7,
    name: 'Emerald Expert',
    description: 'Your expertise grows with every achievement!',
    icon: '💚',
    color: '#50C878',
  },
  {
    level: 8,
    name: 'Sapphire Sage',
    description: 'Wisdom and experience shine through!',
    icon: '💙',
    color: '#0F52BA',
  },
  {
    level: 9,
    name: 'Obsidian Oracle',
    description: 'A master of the craft, respected by all!',
    icon: '🖤',
    color: '#353935',
  },
  {
    level: 10,
    name: 'Legendary Legend',
    description: "You've achieved legendary status - truly remarkable!",
    icon: '👑',
    color: '#9400D3',
  },
  {
    level: 12,
    name: 'Mythic Master',
    description: 'Your achievements have become the stuff of legends!',
    icon: '🌟',
    color: '#FF69B4',
  },
  {
    level: 15,
    name: 'Cosmic Champion',
    description: "You've transcended all expectations - cosmic level!",
    icon: '🌌',
    color: '#8B00FF',
  },
  {
    level: 20,
    name: 'Ultimate Unicorn',
    description: 'A rare and magical achiever - one of a kind!',
    icon: '🦄',
    color: '#FF1493',
  },
];

// Daily challenges
const dailyChallenges = [
  {
    key: 'DAILY_SPARK_A',
    title: 'Morning Momentum',
    description: 'Update your profile or add a new skill',
    xpReward: 30,
    icon: '🌅',
  },
  {
    key: 'DAILY_SPARK_B',
    title: 'Midday Maven',
    description: 'Apply to a job or engage with a post',
    xpReward: 30,
    icon: '☀️',
  },
  {
    key: 'DAILY_SPARK_C',
    title: 'Evening Excellence',
    description: 'Review your applications or update your CV',
    xpReward: 30,
    icon: '🌙',
  },
];

async function seedXpSystem() {
  console.log('🎮 Seeding XP System...\n');

  // Seed Achievement Definitions
  console.log('📋 Creating Achievement Definitions...');
  for (const achievement of achievementDefinitions) {
    await prisma.achievementDefinition.upsert({
      where: { key: achievement.key },
      update: achievement,
      create: achievement,
    });
    console.log(`  ✅ ${achievement.title} (${achievement.key})`);
  }

  // Seed Badge Definitions
  console.log('\n🏅 Creating Badge Definitions...');
  for (const badge of badgeDefinitions) {
    await prisma.badgeDefinition.upsert({
      where: { level: badge.level },
      update: badge,
      create: badge,
    });
    console.log(`  ✅ Level ${badge.level}: ${badge.name}`);
  }

  // Seed Daily Challenges
  console.log('\n📆 Creating Daily Challenges...');
  for (const challenge of dailyChallenges) {
    const existing = await prisma.dailyChallenge.findFirst({
      where: { key: challenge.key },
    });
    if (!existing) {
      await prisma.dailyChallenge.create({ data: challenge });
      console.log(`  ✅ ${challenge.title}`);
    } else {
      await prisma.dailyChallenge.update({
        where: { id: existing.id },
        data: challenge,
      });
      console.log(`  🔄 Updated: ${challenge.title}`);
    }
  }

  console.log('\n✨ XP System seeding complete!\n');
}

// Run seed
seedXpSystem()
  .catch((e) => {
    console.error('❌ Error seeding XP system:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
