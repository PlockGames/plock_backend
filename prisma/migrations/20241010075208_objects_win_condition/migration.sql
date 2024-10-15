-- CreateTable
CREATE TABLE "ObjectsGame" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ObjectsGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WinConditionGame" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WinConditionGame_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ObjectsGame_gameId_idx" ON "ObjectsGame"("gameId");

-- CreateIndex
CREATE INDEX "WinConditionGame_gameId_idx" ON "WinConditionGame"("gameId");

-- AddForeignKey
ALTER TABLE "ObjectsGame" ADD CONSTRAINT "ObjectsGame_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WinConditionGame" ADD CONSTRAINT "WinConditionGame_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
