-- CreateEnum
CREATE TYPE "AchievementCategory" AS ENUM ('DAILY', 'WEEKLY', 'CAREER', 'PROFILE', 'COMMUNITY', 'CV', 'MILESTONE', 'GENERAL');

-- CreateEnum
CREATE TYPE "AchievementConditionType" AS ENUM ('APPLICATION_COUNT', 'INTERVIEW_COUNT', 'POST_COUNT', 'COMMENT_COUNT', 'INTERACTION_COUNT', 'CV_COUNT', 'PROJECT_COUNT', 'SKILL_COUNT', 'EXPERIENCE_COUNT', 'PROFILE_COMPLETE', 'ADVICE_CONSULTATION', 'ADVICE_STEP');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "xp" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "voice_interview_sessions" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT,
    "streamUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "cv" JSONB,
    "jobDescription" JSONB,
    "report" JSONB,
    "history" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "voice_interview_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievement_definitions" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "xpReward" INTEGER NOT NULL,
    "icon" TEXT,
    "category" "AchievementCategory" NOT NULL DEFAULT 'GENERAL',
    "repeatable" BOOLEAN NOT NULL DEFAULT false,
    "maxRepeats" INTEGER,
    "conditionType" "AchievementConditionType",
    "conditionValue" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "achievement_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementDefId" TEXT NOT NULL,
    "claimed" BOOLEAN NOT NULL DEFAULT false,
    "claimedAt" TIMESTAMP(3),
    "meta" JSONB,
    "earnCount" INTEGER NOT NULL DEFAULT 1,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badge_definitions" (
    "id" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "badge_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_badges" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeDefId" TEXT NOT NULL,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_challenges" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "xpReward" INTEGER NOT NULL DEFAULT 30,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_challenge_completions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date" DATE NOT NULL,

    CONSTRAINT "daily_challenge_completions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "voice_interview_sessions_sessionId_key" ON "voice_interview_sessions"("sessionId");

-- CreateIndex
CREATE INDEX "voice_interview_sessions_userId_idx" ON "voice_interview_sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "achievement_definitions_key_key" ON "achievement_definitions"("key");

-- CreateIndex
CREATE INDEX "achievement_definitions_key_idx" ON "achievement_definitions"("key");

-- CreateIndex
CREATE INDEX "achievement_definitions_category_idx" ON "achievement_definitions"("category");

-- CreateIndex
CREATE INDEX "user_achievements_userId_idx" ON "user_achievements"("userId");

-- CreateIndex
CREATE INDEX "user_achievements_achievementDefId_idx" ON "user_achievements"("achievementDefId");

-- CreateIndex
CREATE INDEX "user_achievements_claimed_idx" ON "user_achievements"("claimed");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_userId_achievementDefId_key" ON "user_achievements"("userId", "achievementDefId");

-- CreateIndex
CREATE UNIQUE INDEX "badge_definitions_level_key" ON "badge_definitions"("level");

-- CreateIndex
CREATE INDEX "badge_definitions_level_idx" ON "badge_definitions"("level");

-- CreateIndex
CREATE INDEX "user_badges_userId_idx" ON "user_badges"("userId");

-- CreateIndex
CREATE INDEX "user_badges_badgeDefId_idx" ON "user_badges"("badgeDefId");

-- CreateIndex
CREATE UNIQUE INDEX "user_badges_userId_badgeDefId_key" ON "user_badges"("userId", "badgeDefId");

-- CreateIndex
CREATE INDEX "daily_challenges_key_idx" ON "daily_challenges"("key");

-- CreateIndex
CREATE INDEX "daily_challenge_completions_userId_idx" ON "daily_challenge_completions"("userId");

-- CreateIndex
CREATE INDEX "daily_challenge_completions_challengeId_idx" ON "daily_challenge_completions"("challengeId");

-- CreateIndex
CREATE INDEX "daily_challenge_completions_date_idx" ON "daily_challenge_completions"("date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_challenge_completions_userId_challengeId_date_key" ON "daily_challenge_completions"("userId", "challengeId", "date");

-- AddForeignKey
ALTER TABLE "voice_interview_sessions" ADD CONSTRAINT "voice_interview_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievementDefId_fkey" FOREIGN KEY ("achievementDefId") REFERENCES "achievement_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badgeDefId_fkey" FOREIGN KEY ("badgeDefId") REFERENCES "badge_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_challenge_completions" ADD CONSTRAINT "daily_challenge_completions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_challenge_completions" ADD CONSTRAINT "daily_challenge_completions_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "daily_challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
