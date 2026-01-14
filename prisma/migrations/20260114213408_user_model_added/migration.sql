/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Nota` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Nota" ADD COLUMN     "userId" INTEGER;

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Nota_userId_key" ON "Nota"("userId");

-- AddForeignKey
ALTER TABLE "Nota" ADD CONSTRAINT "Nota_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
