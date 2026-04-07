/*
  Warnings:

  - You are about to drop the column `reminderSent` on the `Nota` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Nota" DROP COLUMN "reminderSent",
ADD COLUMN     "reminder1DaySent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reminder3DaySent" BOOLEAN NOT NULL DEFAULT false;
