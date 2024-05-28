-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "tags" TEXT[],
    "creatorId" INTEGER NOT NULL,
    "creationDate" TIMESTAMP(3) NOT NULL,
    "gameUrl" TEXT NOT NULL,
    "playTime" TEXT NOT NULL,
    "gameType" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "likes" INTEGER NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_id_fkey" FOREIGN KEY ("id") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
