/*
  Warnings:

  - You are about to drop the `ObjectsGame` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ObjectsGame" DROP CONSTRAINT "ObjectsGame_gameId_fkey";

-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "gameId" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "WinConditionGame" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "ObjectsGame";

-- CreateIndex
CREATE INDEX "Media_gameId_idx" ON "Media"("gameId");

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
