/*
  Warnings:

  - The `result_data` column on the `jobs` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."jobs" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "expiresAt" TIMESTAMP(3),
DROP COLUMN "result_data",
ADD COLUMN     "result_data" JSONB;

-- CreateIndex
CREATE INDEX "jobs_status_createdAt_expiresAt_idx" ON "public"."jobs"("status", "createdAt", "expiresAt");
