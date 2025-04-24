import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { Media, Prisma, User } from '@prisma/client';
import { PrismaService } from '../shared/modules/prisma/prisma.service';
import { GameCreateDto, GameDto, GameUpdateDto, PlayTimeDto } from './game.dto';
import { MinioClientService } from '../shared/modules/minio-client/minio-client.service';
import * as fs from 'fs';
import { tmpdir } from 'os';
import { Readable } from 'stream';
import * as path from 'path';
import { createPaginator } from 'prisma-pagination';
import { LikeService } from '../like/like.service';

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly minioClientService: MinioClientService,
    private readonly likeService: LikeService,
  ) {}

  public async getAllGames(page: number, perPage: number, user?: User) {
    this.logger.log(
      `Retrieving all games - Page: ${page}, PerPage: ${perPage}`,
    );
    const paginate = createPaginator({ perPage });

    const games = await paginate<GameDto, Prisma.GameFindManyArgs>(
      this.prisma.game,
      {
        where: {},
        include: {
          Taggable: {
            include: {
              tag: true,
            },
          },
          creator: true,
        },
        orderBy: {
          id: 'desc',
        },
      },
      {
        page,
      },
    );

    // Añade la propiedad hasLiked a cada juego
    const gamesWithHasLiked = await Promise.all(
      games.data.map(async (game) => {
        // Corrigiendo el orden de los parámetros: primero gameId, luego userId
        const hasLiked = await this.likeService.hasLikedGame(game.id, user?.id);
        return {
          ...game,
          hasLiked,
        };
      }),
    );

    this.logger.log(
      `Retrieved ${gamesWithHasLiked.length} games with like status`,
    );
    return {
      ...games,
      data: gamesWithHasLiked,
    };
  }

  public async findAllMyGames(page: number, perPage: number, user: User) {
    this.logger.log(
      `Retrieving all games for user ID: ${user.id} - Page: ${page}, PerPage: ${perPage}`,
    );
    const paginate = createPaginator({ perPage });
    const games = await paginate<GameDto, Prisma.GameFindManyArgs>(
      this.prisma.game,
      {
        where: { creatorId: user.id },
        include: {
          Taggable: {
            include: {
              tag: true,
            },
          },
          creator: true,
        },
        orderBy: {
          id: 'desc',
        },
      },
      {
        page,
      },
    );
    this.logger.log(
      `Retrieved ${games.data.length} games for user ID: ${user.id}`,
    );

    // Añade la propiedad hasLiked a cada juego
    const gamesWithHasLiked = await Promise.all(
      games.data.map(async (game) => {
        // Corrigiendo el orden de los parámetros: primero gameId, luego userId
        const hasLiked = await this.likeService.hasLikedGame(game.id, user.id);
        return {
          ...game,
          hasLiked,
        };
      }),
    );
    this.logger.log(
      `Retrieved ${gamesWithHasLiked.length} games with like status for user ID: ${user.id}`,
    );
    return {
      ...games,
      data: gamesWithHasLiked,
    };
  }

  public async getGame(id: string, user?: User) {
    this.logger.log(`Retrieving game with ID: ${id}`);
    const game = await this.prisma.game.findUnique({
      where: { id },
      include: {
        Taggable: {
          include: {
            tag: true,
          },
        },
        creator: true,
      },
    });
    if (!game) this.logger.warn(`Game with ID: ${id} not found`);
    this.logger.log(`Game retrieved: ${JSON.stringify(game)}`);

    const hasLiked = await this.likeService.hasLikedGame(id, user?.id);
    return {
      ...game,
      hasLiked: hasLiked,
    };
  }

  public async createGame(user: User, game: GameCreateDto) {
    this.logger.log(`Creating game: ${game.title} by user ID: ${user.id}`);
    const folderExists = await this.minioClientService.folderExists(
      `games/${game.title}`,
    );
    if (folderExists) {
      this.logger.warn(`Game already exists: ${game.title}`);
      throw new HttpException('Game already exists', HttpStatus.BAD_REQUEST);
    }

    const tempFilePath = path.join(tmpdir(), `${Date.now()}-contentGame.json`);
    fs.writeFileSync(tempFilePath, JSON.stringify(game.contentGame));

    const fileBuffer = fs.readFileSync(tempFilePath);

    const uploadGame = await this.minioClientService.uploadJsonFile(
      {
        originalname: 'contentGame.json',
        mimetype: 'application/json',
        buffer: fileBuffer,
        size: fileBuffer.length,
        stream: Readable.from(fileBuffer),
      } as Express.Multer.File,
      game.title,
      'game',
    );

    fs.unlinkSync(tempFilePath);
    this.logger.log(`Game content uploaded for: ${game.title}`);

    delete game.contentGame;
    const createdGame = await this.prisma.game.create({
      data: {
        title: game.title,
        gameUrl: `${process.env.MINIO_URL}/${process.env.MINIO_BUCKET}/${uploadGame.filename}`,
        playTime: game.playTime,
        gameType: game.gameType,
        thumbnailUrl: game.thumbnailUrl,
        creator: { connect: { id: user.id } },
        creationDate: new Date(),
        Taggable: {
          create: game.tags.map((tagId) => ({
            tag: { connect: { id: tagId } },
          })),
        },
      },
      include: {
        Taggable: {
          include: {
            tag: true,
          },
        },
      },
    });

    this.logger.log(`Game created with ID: ${createdGame.id}`);
    return createdGame;
  }

  public async updateGame(id: string, data: GameUpdateDto) {
    this.logger.log(`Updating game ID: ${id}`);
    const game = await this.getGame(id);
    this.logger.log(`Game found for update ID: ${id}`);
    if (!game) {
      this.logger.warn(`Game not found for update ID: ${id}`);
      throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
    }

    let contentGameUrl = game.gameUrl;

    if (data.contentGame) {
      const existingFileName = `games/${game.title}/${contentGameUrl.split('/').pop()}`;

      const tempFilePath = path.join(
        tmpdir(),
        `${Date.now()}-contentGame.json`,
      );
      fs.writeFileSync(tempFilePath, JSON.stringify(data.contentGame));

      const fileBuffer = fs.readFileSync(tempFilePath);

      const uploadGame = await this.minioClientService.updateJsonFile(
        {
          originalname: existingFileName || 'contentGame.json',
          mimetype: 'application/json',
          buffer: fileBuffer,
          size: fileBuffer.length,
          stream: Readable.from(fileBuffer),
        } as Express.Multer.File,
        existingFileName,
        data.title || game.title,
        'game',
      );

      fs.unlinkSync(tempFilePath);
      this.logger.log(`Game content updated for ID: ${id}`);

      contentGameUrl = `${process.env.MINIO_URL}/${process.env.MINIO_BUCKET}/${uploadGame.filename}`;
    }

    delete data.contentGame;
    if (data.tags) {
      delete data.tags;
    }

    const updatedGame = await this.prisma.game.update({
      where: { id },
      data: {
        ...data,
        gameUrl: contentGameUrl,
      },
    });

    this.logger.log(`Game updated with ID: ${id}`);
    return updatedGame;
  }

  public async deleteGame(id: string, user: User) {
    this.logger.log(`Deleting game ID: ${id}`);
    const game = await this.getGame(id, user);
    if (!game) {
      this.logger.warn(`Game not found for deletion ID: ${id}`);
      throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
    }
    await this.minioClientService.deleteFolder(`games/${game.title}`);
    this.logger.log(`Game content deleted from Minio for ID: ${id}`);
    const deletedGame = await this.prisma.game.delete({
      where: { id },
    });
    this.logger.log(`Game deleted with ID: ${id}`);
    return deletedGame;
  }

  public async recordPlayTime(
    user: User,
    gameId: string,
    playTimeDto: PlayTimeDto,
  ) {
    this.logger.log(
      `Recording play time for user ID: ${user.id}, game ID: ${gameId}`,
    );
    const existingRecord = await this.prisma.playHistory.findFirst({
      where: { userId: user.id, gameId },
    });

    if (existingRecord) {
      await this.prisma.playHistory.update({
        where: { id: existingRecord.id },
        data: {
          playTime: existingRecord.playTime + playTimeDto.playTime,
          lastPlayed: new Date(),
        },
      });
      this.logger.log(
        `Updated play time for user ID: ${user.id}, game ID: ${gameId}`,
      );
    } else {
      await this.prisma.playHistory.create({
        data: {
          userId: user.id,
          gameId,
          playTime: playTimeDto.playTime,
        },
      });
      this.logger.log(
        `Created play time record for user ID: ${user.id}, game ID: ${gameId}`,
      );
    }
    return existingRecord;
  }

  public async uploadGameImages(
    gameId: string,
    files: Express.Multer.File[],
  ): Promise<Media[]> {
    this.logger.log(`Uploading multiple images for game ID: ${gameId}`);

    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      include: { creator: true },
    });

    if (!game) {
      this.logger.warn(`Game with ID: ${gameId} not found`);
      throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
    }

    const gameTitle = game.title;

    const uploadedFiles = await this.minioClientService.uploadMultipleMedia(
      files,
      gameTitle,
      true,
    );

    const mediaData = uploadedFiles.map((file) => ({
      filename: `${process.env.MINIO_URL}/${process.env.MINIO_BUCKET}/${file.filename}`,
      mimetype:
        files.find((f) => f.path === file.filename)?.mimetype || 'image/png',
      name: path.basename(file.filename),
      size: files.find((f) => f.path === file.filename)?.size || 0,
      thumbnailFileName: file.thumbnailFileName
        ? `${process.env.MINIO_URL}/${process.env.MINIO_BUCKET}/${file.thumbnailFileName}`
        : null,
      userId: game.creatorId,
      gameId: gameId,
    }));

    const createdMedia = await Promise.all(
      mediaData.map((data) => this.prisma.media.create({ data })),
    );

    this.logger.log(
      `Uploaded and stored ${createdMedia.length} images for game ID: ${gameId}`,
    );

    return createdMedia;
  }

  public async getGameImages(gameId: string): Promise<Media[]> {
    this.logger.log(`Retrieving images for game ID: ${gameId}`);

    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      this.logger.warn(`Game with ID: ${gameId} not found`);
      throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
    }

    const media = await this.prisma.media.findMany({
      where: { gameId },
    });

    this.logger.log(`Retrieved ${media.length} images for game ID: ${gameId}`);
    return media;
  }

  public async getCommentCount(gameId: string): Promise<number> {
    this.logger.log(`Getting comment count for game ID: ${gameId}`);
    const count = await this.prisma.comment.count({
      where: { gameId },
    });
    this.logger.log(`Found ${count} comments for game ID: ${gameId}`);
    return count;
  }

  public async getGamesByUserId(
    userId: string,
    page: number,
    perPage: number,
    currentUser?: User,
  ) {
    this.logger.log(
      `Retrieving all games for user ID: ${userId} - Page: ${page}, PerPage: ${perPage}`,
    );
    const paginate = createPaginator({ perPage });
    const games = await paginate<GameDto, Prisma.GameFindManyArgs>(
      this.prisma.game,
      {
        where: { creatorId: userId },
        include: {
          Taggable: {
            include: {
              tag: true,
            },
          },
          creator: true,
        },
        orderBy: {
          id: 'desc',
        },
      },
      {
        page,
      },
    );
    this.logger.log(
      `Retrieved ${games.data.length} games for user ID: ${userId}`,
    );

    // Add hasLiked property to each game if a current user is provided
    if (currentUser) {
      const gamesWithHasLiked = await Promise.all(
        games.data.map(async (game) => {
          // Corrigiendo el orden de los parámetros: primero gameId, luego userId
          const hasLiked = await this.likeService.hasLikedGame(
            game.id,
            currentUser.id,
          );
          this.logger.log(
            `Game ${game.id} - hasLiked: ${hasLiked} for user ${currentUser.id}`,
          );

          const commentsCount = await this.getCommentCount(game.id);
          return {
            ...game,
            hasLiked,
            commentsCount,
          };
        }),
      );
      this.logger.log(
        `Retrieved ${gamesWithHasLiked.length} games with like status for user ID: ${userId}`,
      );
      return {
        ...games,
        data: gamesWithHasLiked,
      };
    }

    // If no current user, just return games without hasLiked property
    return games;
  }
}
