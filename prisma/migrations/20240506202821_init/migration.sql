-- CreateTable
CREATE TABLE "Game" (
    "id" SERIAL NOT NULL,
    "gameId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "tags" TEXT[],
    "creatorId" TEXT NOT NULL,
    "creationDate" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "GameObject" (
    "id" SERIAL NOT NULL,
    "objectId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "positionX" DOUBLE PRECISION NOT NULL,
    "positionY" DOUBLE PRECISION NOT NULL,
    "spriteUrl" TEXT NOT NULL,
    "width" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "speed" DOUBLE PRECISION NOT NULL,
    "force" DOUBLE PRECISION NOT NULL,
    "direction" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "levelId" INTEGER,

    CONSTRAINT "GameObject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Level" (
    "id" SERIAL NOT NULL,
    "backgroundUrl" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,

    CONSTRAINT "Level_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WinCondition" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "requiredItems" TEXT[],
    "targetX" DOUBLE PRECISION NOT NULL,
    "targetY" DOUBLE PRECISION NOT NULL,
    "gameId" TEXT NOT NULL,

    CONSTRAINT "WinCondition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Game_gameId_key" ON "Game"("gameId");

-- CreateIndex
CREATE UNIQUE INDEX "GameObject_objectId_key" ON "GameObject"("objectId");

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("gameId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameObject" ADD CONSTRAINT "GameObject_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("gameId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameObject" ADD CONSTRAINT "GameObject_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "Level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Level" ADD CONSTRAINT "Level_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("gameId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WinCondition" ADD CONSTRAINT "WinCondition_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("gameId") ON DELETE RESTRICT ON UPDATE CASCADE;
