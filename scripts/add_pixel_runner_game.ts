import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting to add Pixel Runner game to database...');

  // 1. Récupérer le fichier JSON du jeu
  const gameDataPath = path.join(
    __dirname,
    '../../plock_mobile/lib/games/pixel_runner/game_data.json',
  );
  const gameData = JSON.parse(fs.readFileSync(gameDataPath, 'utf8'));

  // 2. Récupérer un utilisateur aléatoire (autre que l'admin)
  const randomUser = await prisma.user.findFirst({
    where: {
      role: 'USER',
      NOT: {
        username: 'admin',
      },
    },
    orderBy: {
      id: 'asc', // Pour garantir une sélection déterministe
    },
  });

  if (!randomUser) {
    console.error(
      'No user found in database. Make sure to run the seed script first.',
    );
    process.exit(1);
  }

  console.log(
    `Selected user ${randomUser.username} (${randomUser.email}) as game creator`,
  );

  // 3. Récupérer les tags
  const arcadeTag = await prisma.tag.findFirst({
    where: { name: 'Arcade' },
  });

  const actionTag = await prisma.tag.findFirst({
    where: { name: 'Action' },
  });

  if (!arcadeTag || !actionTag) {
    console.error(
      'Required tags not found. Make sure tags are available in the database.',
    );
    process.exit(1);
  }

  // 4. Préparer le contenu du jeu pour l'upload
  const tempFilePath = path.join(process.cwd(), 'temp-game-data.json');
  fs.writeFileSync(tempFilePath, JSON.stringify(gameData));
  // Fichier prêt pour une utilisation ultérieure si nécessaire

  // 5. Créer le jeu dans la base de données
  const game = await prisma.game.create({
    data: {
      title: 'Pixel Runner',
      gameUrl: `${process.env.MINIO_URL || 'https://example.com'}/${
        process.env.MINIO_BUCKET || 'plock'
      }/games/pixel-runner/game.json`,
      winConditionUrl: null,
      gameObjectsUrl: null,
      playTime: '2-3 min',
      gameType: 'Arcade',
      thumbnailUrl:
        'https://via.placeholder.com/300x200/4287f5/ffffff?text=Pixel+Runner',
      likes: 42,
      creationDate: new Date(),
      creatorId: randomUser.id,
      // Associer les tags
      Taggable: {
        create: [{ tagId: arcadeTag.id }, { tagId: actionTag.id }],
      },
    },
    include: {
      Taggable: {
        include: {
          tag: true,
        },
      },
      creator: true,
    },
  });

  console.log(`Created game: ${game.title} (ID: ${game.id})`);
  console.log(`Game creator: ${game.creator.username}`);
  console.log(`Tags: ${game.Taggable.map((t) => t.tag.name).join(', ')}`);

  // 6. Ajouter quelques commentaires fictifs
  const comments = [
    'Super jeu, simple mais addictif !',
    "J'adore le design minimaliste",
    'Mon meilleur score est 42, qui peut faire mieux ?',
    'Comment on fait pour sauter plus haut ?',
  ];

  for (const commentText of comments) {
    // Trouver un utilisateur aléatoire pour commenter (différent du créateur)
    const commenter = await prisma.user.findFirst({
      where: {
        id: {
          not: randomUser.id,
        },
      },
      orderBy: {
        id: 'desc', // Pour avoir un utilisateur différent
      },
    });

    if (commenter) {
      await prisma.comment.create({
        data: {
          content: commentText,
          userId: commenter.id,
          gameId: game.id,
        },
      });
      console.log(`Added comment by ${commenter.username}: "${commentText}"`);
    }
  }

  // 7. Ajouter quelques likes
  const likers = await prisma.user.findMany({
    take: 10, // Prendre 10 utilisateurs aléatoires
    where: {
      id: {
        not: randomUser.id, // Exclure le créateur
      },
    },
  });

  for (const liker of likers) {
    await prisma.like.create({
      data: {
        userId: liker.id,
        gameId: game.id,
      },
    });
    console.log(`User ${liker.username} liked the game`);
  }

  // 8. Nettoyer les fichiers temporaires
  if (fs.existsSync(tempFilePath)) {
    fs.unlinkSync(tempFilePath);
    console.log('Temporary files cleaned up');
  }

  console.log('Pixel Runner game has been successfully added to the database!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
