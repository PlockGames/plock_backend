-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "isRepost" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "parentPostId" TEXT,
ADD COLUMN     "shareCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "viewsCount" INTEGER NOT NULL DEFAULT 0;
