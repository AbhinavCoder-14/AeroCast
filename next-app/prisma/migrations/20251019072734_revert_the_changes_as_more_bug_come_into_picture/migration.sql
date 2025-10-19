/*
  Warnings:

  - The `result_data` column on the `jobs` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."jobs" DROP COLUMN "result_data",
ADD COLUMN     "result_data" JSONB;
