/*
  Warnings:

  - You are about to drop the `cv_sections` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cv_suggestions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cvs` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."ResumeStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."ResumeSectionType" AS ENUM ('PROFILE', 'SUMMARY', 'EXPERIENCE', 'EDUCATION', 'SKILLS', 'CERTIFICATIONS', 'PROJECTS', 'LANGUAGES', 'CUSTOM');

-- DropForeignKey
ALTER TABLE "public"."cv_sections" DROP CONSTRAINT "cv_sections_cvId_fkey";

-- DropForeignKey
ALTER TABLE "public"."cv_suggestions" DROP CONSTRAINT "cv_suggestions_cvId_fkey";

-- DropForeignKey
ALTER TABLE "public"."cv_suggestions" DROP CONSTRAINT "cv_suggestions_sectionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."cvs" DROP CONSTRAINT "cvs_userId_fkey";

-- DropTable
DROP TABLE "public"."cv_sections";

-- DropTable
DROP TABLE "public"."cv_suggestions";

-- DropTable
DROP TABLE "public"."cvs";

-- DropEnum
DROP TYPE "public"."CvStatus";

-- DropEnum
DROP TYPE "public"."SectionType";

-- CreateTable
CREATE TABLE "public"."resumes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'My Resume',
    "userName" TEXT NOT NULL,
    "status" "public"."ResumeStatus" NOT NULL DEFAULT 'DRAFT',
    "data" JSONB NOT NULL,
    "filePath" TEXT,
    "fileName" TEXT,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "aiScore" DOUBLE PRECISION,
    "lastReviewedAt" TIMESTAMP(3),
    "templateId" TEXT DEFAULT 'modern-1',
    "customStyles" JSONB,
    "careerAdvice" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resume_sections" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "type" "public"."ResumeSectionType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "aiScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resume_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."resume_suggestions" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT,
    "sectionId" TEXT,
    "type" TEXT NOT NULL,
    "original" JSONB NOT NULL,
    "suggested" JSONB NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resume_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "resumes_userId_idx" ON "public"."resumes"("userId");

-- CreateIndex
CREATE INDEX "resumes_status_idx" ON "public"."resumes"("status");

-- CreateIndex
CREATE INDEX "resume_sections_resumeId_idx" ON "public"."resume_sections"("resumeId");

-- CreateIndex
CREATE INDEX "resume_sections_type_idx" ON "public"."resume_sections"("type");

-- CreateIndex
CREATE INDEX "resume_suggestions_resumeId_idx" ON "public"."resume_suggestions"("resumeId");

-- CreateIndex
CREATE INDEX "resume_suggestions_sectionId_idx" ON "public"."resume_suggestions"("sectionId");

-- CreateIndex
CREATE INDEX "resume_suggestions_status_idx" ON "public"."resume_suggestions"("status");

-- AddForeignKey
ALTER TABLE "public"."resumes" ADD CONSTRAINT "resumes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resume_sections" ADD CONSTRAINT "resume_sections_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "public"."resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resume_suggestions" ADD CONSTRAINT "resume_suggestions_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "public"."resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."resume_suggestions" ADD CONSTRAINT "resume_suggestions_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."resume_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
