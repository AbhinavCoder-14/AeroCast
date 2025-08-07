/*
  Warnings:

  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."users";

-- CreateTable
CREATE TABLE "public"."jobs" (
    "jobId" TEXT NOT NULL,
    "city" TEXT NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("jobId")
);
