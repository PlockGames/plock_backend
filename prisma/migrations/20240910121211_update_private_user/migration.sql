/*
  Warnings:

  - You are about to drop the column `privacy` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "privacy",
ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false;
