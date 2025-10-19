/*
  Warnings:

  - You are about to drop the column `completed_at` on the `jobs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."jobs" DROP COLUMN "completed_at",
ADD COLUMN     "completedAt" TIMESTAMP(3);
