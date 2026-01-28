/*
  Warnings:

  - The `jobId` column on the `job_applications` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Job` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `companyName` to the `job_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jobTitle` to the `job_applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `job_applications` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."SkillLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "public"."LanguageProficiency" AS ENUM ('NATIVE', 'FLUENT', 'PROFESSIONAL', 'LIMITED', 'BASIC');

-- CreateEnum
CREATE TYPE "public"."SocialLinkType" AS ENUM ('LINKEDIN', 'GITHUB', 'PORTFOLIO', 'WEBSITE', 'TWITTER', 'YOUTUBE', 'INSTAGRAM', 'FACEBOOK', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."Theme" AS ENUM ('LIGHT', 'DARK', 'SYSTEM');

-- CreateEnum
CREATE TYPE "public"."AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'INACTIVE', 'PENDING_VERIFICATION', 'DELETED');

-- CreateEnum
CREATE TYPE "public"."ProfileVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'CONNECTIONS_ONLY');

-- CreateEnum
CREATE TYPE "public"."ApplicationStatus" AS ENUM ('WISHLIST', 'APPLIED', 'SCREENING', 'ASSESSMENT', 'INTERVIEW', 'OFFER', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'ON_HOLD');

-- CreateEnum
CREATE TYPE "public"."ApplicationSource" AS ENUM ('LINKEDIN', 'INDEED', 'GLASSDOOR', 'COMPANY_WEBSITE', 'REFERRAL', 'RECRUITER', 'JOB_BOARD', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."DocumentType" AS ENUM ('CV', 'COVER_LETTER', 'PORTFOLIO', 'CERTIFICATE', 'TRANSCRIPT', 'RECOMMENDATION', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."DocumentVisibility" AS ENUM ('PRIVATE', 'PUBLIC', 'SHARED');

-- CreateEnum
CREATE TYPE "public"."NotificationType" AS ENUM ('APPLICATION_UPDATE', 'INTERVIEW_REMINDER', 'DEADLINE_REMINDER', 'JOB_RECOMMENDATION', 'MESSAGE', 'SYSTEM', 'ACHIEVEMENT');

-- CreateEnum
CREATE TYPE "public"."NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "public"."ActivityType" AS ENUM ('LOGIN', 'LOGOUT', 'PROFILE_UPDATE', 'APPLICATION_CREATED', 'APPLICATION_UPDATED', 'APPLICATION_DELETED', 'DOCUMENT_UPLOADED', 'DOCUMENT_DELETED', 'INTERVIEW_SCHEDULED', 'JOB_VIEWED', 'COMPANY_VIEWED', 'SETTINGS_CHANGED', 'PASSWORD_CHANGED', 'EMAIL_VERIFIED');

-- CreateEnum
CREATE TYPE "public"."MessageStatus" AS ENUM ('SENT', 'DELIVERED', 'READ', 'ARCHIVED', 'DELETED');

-- DropForeignKey
ALTER TABLE "public"."Feedback" DROP CONSTRAINT "Feedback_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Interview" DROP CONSTRAINT "Interview_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."JobRecommendation" DROP CONSTRAINT "JobRecommendation_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Rate" DROP CONSTRAINT "Rate_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."job_applications" DROP CONSTRAINT "job_applications_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Job" ADD COLUMN     "benefits" TEXT,
ADD COLUMN     "companyId" TEXT,
ADD COLUMN     "externalUrl" TEXT,
ADD COLUMN     "responsibilities" TEXT,
ADD COLUMN     "skills" JSONB,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "source" TEXT;

-- AlterTable
ALTER TABLE "public"."job_applications" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "companyName" TEXT NOT NULL,
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "contactPhone" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "experienceLevel" "public"."ExperienceLevel",
ADD COLUMN     "firstResponseAt" TIMESTAMP(3),
ADD COLUMN     "followUpDate" TIMESTAMP(3),
ADD COLUMN     "interviewDate" TIMESTAMP(3),
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFavorite" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "jobTitle" TEXT NOT NULL,
ADD COLUMN     "jobType" "public"."JobType",
ADD COLUMN     "jobUrl" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "offerReceivedAt" TIMESTAMP(3),
ADD COLUMN     "priority" INTEGER DEFAULT 0,
ADD COLUMN     "remote" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "responseDeadline" TIMESTAMP(3),
ADD COLUMN     "salary" DOUBLE PRECISION,
ADD COLUMN     "salaryCurrency" TEXT DEFAULT 'USD',
ADD COLUMN     "source" "public"."ApplicationSource" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "status" "public"."ApplicationStatus" NOT NULL DEFAULT 'WISHLIST',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "jobId",
ADD COLUMN     "jobId" INTEGER,
ALTER COLUMN "cvId" DROP NOT NULL,
ALTER COLUMN "coverLetterId" DROP NOT NULL;

-- DropTable
DROP TABLE "public"."User";

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "gender" "public"."Gender",
    "birthDate" TIMESTAMP(3),
    "timezone" TEXT DEFAULT 'UTC',
    "preferredLanguage" TEXT DEFAULT 'en',
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "profileImage" TEXT,
    "bannerImage" TEXT,
    "bio" TEXT,
    "headline" TEXT,
    "currentPosition" TEXT,
    "currentCompany" TEXT,
    "industry" TEXT,
    "experienceLevel" "public"."ExperienceLevel",
    "yearsExperience" INTEGER,
    "professionalSummary" TEXT,
    "desiredSalaryMin" DOUBLE PRECISION,
    "desiredSalaryMax" DOUBLE PRECISION,
    "salaryCurrency" TEXT DEFAULT 'USD',
    "theme" "public"."Theme" NOT NULL DEFAULT 'LIGHT',
    "profileVisibility" "public"."ProfileVisibility" NOT NULL DEFAULT 'PRIVATE',
    "showEmail" BOOLEAN NOT NULL DEFAULT false,
    "showPhone" BOOLEAN NOT NULL DEFAULT false,
    "allowMessages" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "isOnboarded" BOOLEAN NOT NULL DEFAULT false,
    "onboardedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "lastActiveAt" TIMESTAMP(3),
    "accountStatus" "public"."AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "suspendedAt" TIMESTAMP(3),
    "suspendedReason" TEXT,
    "deletedAt" TIMESTAMP(3),
    "acceptedTermsAt" TIMESTAMP(3),
    "acceptedPrivacyPolicyAt" TIMESTAMP(3),
    "acceptedMarketingAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "profileVisibility" "public"."ProfileVisibility" NOT NULL DEFAULT 'PRIVATE',
    "showExperience" BOOLEAN NOT NULL DEFAULT true,
    "showEducation" BOOLEAN NOT NULL DEFAULT true,
    "showSkills" BOOLEAN NOT NULL DEFAULT true,
    "allowMessages" BOOLEAN NOT NULL DEFAULT true,
    "allowJobRecommendations" BOOLEAN NOT NULL DEFAULT true,
    "emailJobAlerts" BOOLEAN NOT NULL DEFAULT true,
    "emailInterviewReminders" BOOLEAN NOT NULL DEFAULT true,
    "emailApplicationUpdates" BOOLEAN NOT NULL DEFAULT true,
    "emailWeeklySummary" BOOLEAN NOT NULL DEFAULT true,
    "emailMarketingContent" BOOLEAN NOT NULL DEFAULT false,
    "inAppJobAlerts" BOOLEAN NOT NULL DEFAULT true,
    "inAppInterviewReminders" BOOLEAN NOT NULL DEFAULT true,
    "inAppApplicationUpdates" BOOLEAN NOT NULL DEFAULT true,
    "inAppMessages" BOOLEAN NOT NULL DEFAULT true,
    "defaultView" TEXT DEFAULT 'kanban',
    "dashboardLayout" JSONB,
    "favoriteFilters" JSONB,
    "autoApplyWithProfile" BOOLEAN NOT NULL DEFAULT false,
    "trackApplications" BOOLEAN NOT NULL DEFAULT true,
    "enableAIRecommendations" BOOLEAN NOT NULL DEFAULT true,
    "dataRetentionDays" INTEGER DEFAULT 365,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_skills" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" "public"."SkillLevel" NOT NULL,
    "yearsExperience" INTEGER,
    "category" TEXT,
    "endorsed" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_work_experiences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "order" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_work_experiences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_educations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "fieldOfStudy" TEXT,
    "institution" TEXT NOT NULL,
    "location" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "gpa" TEXT,
    "description" TEXT,
    "order" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_educations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_certifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3),
    "credentialId" TEXT,
    "credentialUrl" TEXT,
    "description" TEXT,
    "order" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_languages" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "proficiency" "public"."LanguageProficiency" NOT NULL,
    "order" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_languages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_projects" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "role" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "url" TEXT,
    "technologies" TEXT,
    "highlights" TEXT,
    "order" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_awards" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "order" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_awards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_publications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "publisher" TEXT,
    "publicationDate" TIMESTAMP(3) NOT NULL,
    "url" TEXT,
    "description" TEXT,
    "authors" TEXT,
    "order" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_publications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_volunteer_work" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "order" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_volunteer_work_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_references" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "relationship" TEXT,
    "description" TEXT,
    "order" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_social_links" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."SocialLinkType" NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_social_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_desired_job_types" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobType" "public"."JobType" NOT NULL,
    "priority" INTEGER DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_desired_job_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_desired_locations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL,
    "remote" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_desired_locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_job_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "preferenceType" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "priority" INTEGER DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_job_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "description" TEXT,
    "industry" TEXT,
    "size" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "linkedinUrl" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Document" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."DocumentType" NOT NULL,
    "description" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "visibility" "public"."DocumentVisibility" NOT NULL DEFAULT 'PRIVATE',
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "templateId" TEXT,
    "styling" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT DEFAULT '#3B82F6',
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."NotificationType" NOT NULL,
    "priority" "public"."NotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "actionUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" "public"."ActivityType" NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Message" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "status" "public"."MessageStatus" NOT NULL DEFAULT 'SENT',
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_JobApplicationToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_JobApplicationToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "public"."users"("role");

-- CreateIndex
CREATE INDEX "users_isActive_idx" ON "public"."users"("isActive");

-- CreateIndex
CREATE INDEX "users_accountStatus_idx" ON "public"."users"("accountStatus");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "public"."users"("createdAt");

-- CreateIndex
CREATE INDEX "users_industry_idx" ON "public"."users"("industry");

-- CreateIndex
CREATE INDEX "users_experienceLevel_idx" ON "public"."users"("experienceLevel");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "public"."UserSettings"("userId");

-- CreateIndex
CREATE INDEX "user_skills_userId_idx" ON "public"."user_skills"("userId");

-- CreateIndex
CREATE INDEX "user_skills_category_idx" ON "public"."user_skills"("category");

-- CreateIndex
CREATE UNIQUE INDEX "user_skills_userId_name_key" ON "public"."user_skills"("userId", "name");

-- CreateIndex
CREATE INDEX "user_work_experiences_userId_idx" ON "public"."user_work_experiences"("userId");

-- CreateIndex
CREATE INDEX "user_work_experiences_startDate_idx" ON "public"."user_work_experiences"("startDate");

-- CreateIndex
CREATE INDEX "user_educations_userId_idx" ON "public"."user_educations"("userId");

-- CreateIndex
CREATE INDEX "user_educations_startDate_idx" ON "public"."user_educations"("startDate");

-- CreateIndex
CREATE INDEX "user_certifications_userId_idx" ON "public"."user_certifications"("userId");

-- CreateIndex
CREATE INDEX "user_certifications_issueDate_idx" ON "public"."user_certifications"("issueDate");

-- CreateIndex
CREATE INDEX "user_languages_userId_idx" ON "public"."user_languages"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_languages_userId_language_key" ON "public"."user_languages"("userId", "language");

-- CreateIndex
CREATE INDEX "user_projects_userId_idx" ON "public"."user_projects"("userId");

-- CreateIndex
CREATE INDEX "user_awards_userId_idx" ON "public"."user_awards"("userId");

-- CreateIndex
CREATE INDEX "user_awards_date_idx" ON "public"."user_awards"("date");

-- CreateIndex
CREATE INDEX "user_publications_userId_idx" ON "public"."user_publications"("userId");

-- CreateIndex
CREATE INDEX "user_publications_publicationDate_idx" ON "public"."user_publications"("publicationDate");

-- CreateIndex
CREATE INDEX "user_volunteer_work_userId_idx" ON "public"."user_volunteer_work"("userId");

-- CreateIndex
CREATE INDEX "user_references_userId_idx" ON "public"."user_references"("userId");

-- CreateIndex
CREATE INDEX "user_social_links_userId_idx" ON "public"."user_social_links"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_social_links_userId_type_key" ON "public"."user_social_links"("userId", "type");

-- CreateIndex
CREATE INDEX "user_desired_job_types_userId_idx" ON "public"."user_desired_job_types"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_desired_job_types_userId_jobType_key" ON "public"."user_desired_job_types"("userId", "jobType");

-- CreateIndex
CREATE INDEX "user_desired_locations_userId_idx" ON "public"."user_desired_locations"("userId");

-- CreateIndex
CREATE INDEX "user_desired_locations_country_idx" ON "public"."user_desired_locations"("country");

-- CreateIndex
CREATE INDEX "user_job_preferences_userId_idx" ON "public"."user_job_preferences"("userId");

-- CreateIndex
CREATE INDEX "user_job_preferences_preferenceType_idx" ON "public"."user_job_preferences"("preferenceType");

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "public"."Company"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Company_slug_key" ON "public"."Company"("slug");

-- CreateIndex
CREATE INDEX "Company_name_idx" ON "public"."Company"("name");

-- CreateIndex
CREATE INDEX "Company_industry_idx" ON "public"."Company"("industry");

-- CreateIndex
CREATE INDEX "Document_userId_idx" ON "public"."Document"("userId");

-- CreateIndex
CREATE INDEX "Document_type_idx" ON "public"."Document"("type");

-- CreateIndex
CREATE INDEX "Document_isDefault_idx" ON "public"."Document"("isDefault");

-- CreateIndex
CREATE INDEX "Tag_userId_idx" ON "public"."Tag"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_userId_key" ON "public"."Tag"("name", "userId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "public"."Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "public"."Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "public"."Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "public"."Notification"("createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_userId_idx" ON "public"."ActivityLog"("userId");

-- CreateIndex
CREATE INDEX "ActivityLog_type_idx" ON "public"."ActivityLog"("type");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "public"."ActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_entityType_entityId_idx" ON "public"."ActivityLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "public"."Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_receiverId_idx" ON "public"."Message"("receiverId");

-- CreateIndex
CREATE INDEX "Message_status_idx" ON "public"."Message"("status");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "public"."Message"("createdAt");

-- CreateIndex
CREATE INDEX "_JobApplicationToTag_B_index" ON "public"."_JobApplicationToTag"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Job_slug_key" ON "public"."Job"("slug");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "public"."Job"("status");

-- CreateIndex
CREATE INDEX "Job_companyName_idx" ON "public"."Job"("companyName");

-- CreateIndex
CREATE INDEX "Job_type_idx" ON "public"."Job"("type");

-- CreateIndex
CREATE INDEX "Job_remote_idx" ON "public"."Job"("remote");

-- CreateIndex
CREATE INDEX "Job_postedAt_idx" ON "public"."Job"("postedAt");

-- CreateIndex
CREATE INDEX "job_applications_userId_idx" ON "public"."job_applications"("userId");

-- CreateIndex
CREATE INDEX "job_applications_status_idx" ON "public"."job_applications"("status");

-- CreateIndex
CREATE INDEX "job_applications_appliedAt_idx" ON "public"."job_applications"("appliedAt");

-- CreateIndex
CREATE INDEX "job_applications_companyName_idx" ON "public"."job_applications"("companyName");

-- CreateIndex
CREATE INDEX "job_applications_isArchived_idx" ON "public"."job_applications"("isArchived");

-- AddForeignKey
ALTER TABLE "public"."UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_skills" ADD CONSTRAINT "user_skills_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_work_experiences" ADD CONSTRAINT "user_work_experiences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_educations" ADD CONSTRAINT "user_educations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_certifications" ADD CONSTRAINT "user_certifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_languages" ADD CONSTRAINT "user_languages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_projects" ADD CONSTRAINT "user_projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_awards" ADD CONSTRAINT "user_awards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_publications" ADD CONSTRAINT "user_publications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_volunteer_work" ADD CONSTRAINT "user_volunteer_work_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_references" ADD CONSTRAINT "user_references_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_social_links" ADD CONSTRAINT "user_social_links_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_desired_job_types" ADD CONSTRAINT "user_desired_job_types_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_desired_locations" ADD CONSTRAINT "user_desired_locations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_job_preferences" ADD CONSTRAINT "user_job_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."JobRecommendation" ADD CONSTRAINT "JobRecommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_applications" ADD CONSTRAINT "job_applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_applications" ADD CONSTRAINT "job_applications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_applications" ADD CONSTRAINT "job_applications_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "public"."Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_applications" ADD CONSTRAINT "job_applications_coverLetterId_fkey" FOREIGN KEY ("coverLetterId") REFERENCES "public"."Document"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Job" ADD CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Interview" ADD CONSTRAINT "Interview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Rate" ADD CONSTRAINT "Rate_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Feedback" ADD CONSTRAINT "Feedback_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Document" ADD CONSTRAINT "Document_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ActivityLog" ADD CONSTRAINT "ActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_JobApplicationToTag" ADD CONSTRAINT "_JobApplicationToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."job_applications"("applicationId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_JobApplicationToTag" ADD CONSTRAINT "_JobApplicationToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
