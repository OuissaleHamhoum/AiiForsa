/*
  Warnings:

  - A unique constraint covering the columns `[shareSlug]` on the table `resumes` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."resumes" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastViewedAt" TIMESTAMP(3),
ADD COLUMN     "shareExpiry" TIMESTAMP(3),
ADD COLUMN     "shareSlug" TEXT,
ADD COLUMN     "shareViews" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "resumes_shareSlug_key" ON "public"."resumes"("shareSlug");

-- CreateIndex
CREATE INDEX "resumes_shareSlug_idx" ON "public"."resumes"("shareSlug");

-- CreateIndex
CREATE INDEX "resumes_isPublic_idx" ON "public"."resumes"("isPublic");
