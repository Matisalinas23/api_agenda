/*
  Warnings:

  - Made the column `description` on table `Nota` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Nota" ADD COLUMN     "reminderSent" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "description" SET NOT NULL;
