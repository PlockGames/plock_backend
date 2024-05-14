import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Seed data for the Game model
    const game1 = await prisma.game.create({
        data: {
            gameId: 'game1',
            title: 'Super Mario',
            tags: ['platformer', 'classic'],
            creatorId: 'creator1',
            creationDate: new Date().toISOString(),
            gameUrl: 'https://example.com/super-mario',
            playTime: '2h',
            gameType: 'platformer',
            thumbnailUrl: 'https://example.com/super-mario.png',
            likes: 100,
            comments: {
                create: [
                    {
                        userId: 'user1',
                        comment: 'Great game!',
                        date: new Date().toISOString(),
                    },
                    {
                        userId: 'user2',
                        comment: 'Nostalgic!',
                        date: new Date().toISOString(),
                    },
                ],
            },
            objects: {
                create: [
                    {
                        objectId: 'obj1',
                        type: 'player',
                        positionX: 10.0,
                        positionY: 20.0,
                        spriteUrl: 'https://example.com/mario.png',
                        width: 32.0,
                        height: 64.0,
                        speed: 5.0,
                        force: 10.0,
                        direction: 'right',
                    },
                    {
                        objectId: 'obj2',
                        type: 'enemy',
                        positionX: 100.0,
                        positionY: 50.0,
                        spriteUrl: 'https://example.com/goomba.png',
                        width: 32.0,
                        height: 32.0,
                        speed: 2.0,
                        force: 5.0,
                        direction: 'left',
                    },
                ],
            },
            winConditions: {
                create: [
                    {
                        type: 'reachTarget',
                        requiredItems: ['key'],
                        targetX: 500.0,
                        targetY: 100.0,
                    },
                ],
            },
        },
    });

    console.log('Seeding completed successfully');
}

main()
    .catch((e) => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });