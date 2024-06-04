/*
  Warnings:

  - You are about to drop the column `gameObjectId` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `winConditionId` on the `Game` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Game" DROP COLUMN "gameObjectId",
DROP COLUMN "winConditionId";
