-- CreateEnum
CREATE TYPE "public"."CvStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "public"."SectionType" AS ENUM ('PROFILE', 'SUMMARY', 'EXPERIENCE', 'EDUCATION', 'SKILLS', 'CERTIFICATIONS', 'PROJECTS', 'LANGUAGES', 'CUSTOM');

-- AlterTable
ALTER TABLE "public"."cvs" ADD COLUMN     "aiScore" DOUBLE PRECISION,
ADD COLUMN     "customStyles" JSONB,
ADD COLUMN     "lastReviewedAt" TIMESTAMP(3),
ADD COLUMN     "status" "public"."CvStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "templateId" TEXT DEFAULT 'modern-1',
ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'My Resume';

-- CreateTable
CREATE TABLE "public"."cv_sections" (
    "id" TEXT NOT NULL,
    "cvId" TEXT NOT NULL,
    "type" "public"."SectionType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "aiScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cv_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cv_suggestions" (
    "id" TEXT NOT NULL,
    "cvId" TEXT,
    "sectionId" TEXT,
    "type" TEXT NOT NULL,
    "original" JSONB NOT NULL,
    "suggested" JSONB NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cv_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "cv_sections_cvId_idx" ON "public"."cv_sections"("cvId");

-- CreateIndex
CREATE INDEX "cv_sections_type_idx" ON "public"."cv_sections"("type");

-- CreateIndex
CREATE INDEX "cv_suggestions_cvId_idx" ON "public"."cv_suggestions"("cvId");

-- CreateIndex
CREATE INDEX "cv_suggestions_sectionId_idx" ON "public"."cv_suggestions"("sectionId");

-- CreateIndex
CREATE INDEX "cv_suggestions_status_idx" ON "public"."cv_suggestions"("status");

-- CreateIndex
CREATE INDEX "cvs_status_idx" ON "public"."cvs"("status");

-- AddForeignKey
ALTER TABLE "public"."cv_sections" ADD CONSTRAINT "cv_sections_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "public"."cvs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cv_suggestions" ADD CONSTRAINT "cv_suggestions_cvId_fkey" FOREIGN KEY ("cvId") REFERENCES "public"."cvs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cv_suggestions" ADD CONSTRAINT "cv_suggestions_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."cv_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
