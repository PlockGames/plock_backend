/*
  Warnings:

  - You are about to drop the column `postId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `playCount` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `postId` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `postId` on the `Taggable` table. All the data in the column will be lost.
  - You are about to drop the `Friend` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Review` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[tagId,gameId]` on the table `Taggable` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `gameId` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creationDate` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gameType` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gameUrl` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `playTime` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thumbnailUrl` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_postId_fkey";

-- DropForeignKey
ALTER TABLE "Friend" DROP CONSTRAINT "Friend_friendId_fkey";

-- DropForeignKey
ALTER TABLE "Friend" DROP CONSTRAINT "Friend_userId_fkey";

-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_postId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_userId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_gameId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_userId_fkey";

-- DropForeignKey
ALTER TABLE "Taggable" DROP CONSTRAINT "Taggable_postId_fkey";

-- DropIndex
DROP INDEX "Comment_postId_idx";

-- DropIndex
DROP INDEX "Media_postId_idx";

-- DropIndex
DROP INDEX "Taggable_postId_idx";

-- DropIndex
DROP INDEX "Taggable_tagId_postId_gameId_key";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "postId",
ADD COLUMN     "gameId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Game" DROP COLUMN "description",
DROP COLUMN "playCount",
ADD COLUMN     "creationDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "gameType" TEXT NOT NULL,
ADD COLUMN     "gameUrl" TEXT NOT NULL,
ADD COLUMN     "likes" INTEGER DEFAULT 0,
ADD COLUMN     "playTime" TEXT NOT NULL,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "thumbnailUrl" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Media" DROP COLUMN "postId";

-- AlterTable
ALTER TABLE "Tag" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Taggable" DROP COLUMN "postId",
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "Friend";

-- DropTable
DROP TABLE "Post";

-- DropTable
DROP TABLE "Review";

-- CreateIndex
CREATE INDEX "Comment_gameId_idx" ON "Comment"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "Taggable_tagId_gameId_key" ON "Taggable"("tagId", "gameId");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
