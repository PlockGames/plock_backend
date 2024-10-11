import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../shared/modules/prisma/prisma.service';
import { GameCreateDto, GameResultDto, GameUpdateDto } from './game.dto';
import { MinioClientService } from '../shared/modules/minio-client/minio-client.service';
import * as fs from 'fs';
import { tmpdir } from 'os';
import { Readable } from 'stream';
import * as path from 'path';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class GameService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minioClientService: MinioClientService,
  ) {}

  public async getAllGames(page: number, perPage: number) {
    const paginate = createPaginator({ perPage });
    return paginate<GameResultDto, Prisma.GameFindManyArgs>(
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
  }

  public async getGame(id: string) {
    return this.prisma.game.findUnique({
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
  }

  public async createGame(user: User, game: GameCreateDto) {
    const folderExists = await this.minioClientService.folderExists(
      `games/${game.title}`,
    );
    if (folderExists) {
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

    delete game.contentGame;
    return this.prisma.game.create({
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
  }
  public async updateGame(id: string, data: GameUpdateDto) {
    const game = await this.getGame(id);
    if (!game) {
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

      contentGameUrl = `${process.env.MINIO_URL}/${process.env.MINIO_BUCKET}/${uploadGame.filename}`;
    }

    delete data.contentGame;

    return this.prisma.game.update({
      where: { id },
      data: {
        ...data,
        gameUrl: contentGameUrl,
      },
    });
  }

  public async deleteGame(id: string) {
    const game = await this.getGame(id);
    if (!game) {
      throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
    }
    await this.minioClientService.deleteFolder(`games/${game.title}`);
    return this.prisma.game.delete({
      where: { id },
    });
  }

  public async getAllWinConditionsByGame(gameId: string) {
    return this.prisma.winConditionGame.findMany({
      where: { gameId },
    });
  }
  public async createWinCondition(gameId: string, createWinConditionDto: any) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
    }

    const tempFilePath = path.join(tmpdir(), `${Date.now()}-winCondition.json`);
    fs.writeFileSync(tempFilePath, JSON.stringify(createWinConditionDto));

    const fileBuffer = fs.readFileSync(tempFilePath);

    const uploadWinCondition = await this.minioClientService.uploadJsonFile(
      {
        originalname: 'winCondition.json',
        mimetype: 'application/json',
        buffer: fileBuffer,
        size: fileBuffer.length,
        stream: Readable.from(fileBuffer),
      } as Express.Multer.File,
      game.title,
      'winCondition',
    );

    fs.unlinkSync(tempFilePath);

    return this.prisma.winConditionGame.create({
      data: {
        url: `${process.env.MINIO_URL}/${process.env.MINIO_BUCKET}/${uploadWinCondition.filename}`,
        game: { connect: { id: gameId } },
      },
    });
  }

  public async updateWinCondition(gameId: string, id: string, body: any) {
    const winCondition = await this.prisma.winConditionGame.findUnique({
      where: { id },
      include: {
        game: true,
      },
    });

    if (!winCondition) {
      throw new HttpException('Win condition not found', HttpStatus.NOT_FOUND);
    }

    const existingFileName = `games/${winCondition.game.title}/${winCondition.url.split('/').pop()}`;

    const tempFilePath = path.join(tmpdir(), `${Date.now()}-winCondition.json`);
    fs.writeFileSync(tempFilePath, JSON.stringify(body));

    const fileBuffer = fs.readFileSync(tempFilePath);

    const uploadWinCondition = await this.minioClientService.updateJsonFile(
      {
        originalname: existingFileName || 'winCondition.json',
        mimetype: 'application/json',
        buffer: fileBuffer,
        size: fileBuffer.length,
        stream: Readable.from(fileBuffer),
      } as Express.Multer.File,
      existingFileName,
      winCondition.game.title,
      'winCondition',
    );

    fs.unlinkSync(tempFilePath);

    return this.prisma.winConditionGame.update({
      where: { id },
      data: {
        url: `${process.env.MINIO_URL}/${process.env.MINIO_BUCKET}/${uploadWinCondition.filename}`,
      },
    });
  }
  public async deleteWinCondition(gameId: string, id: string) {
    const winCondition = await this.prisma.winConditionGame.findUnique({
      where: { id },
      include: {
        game: true,
      },
    });

    if (!winCondition) {
      throw new HttpException('Win condition not found', HttpStatus.NOT_FOUND);
    }

    const existingFileName = `games/${winCondition.game.title}/${winCondition.url.split('/').pop()}`;
    await this.minioClientService.delete(existingFileName);

    return this.prisma.winConditionGame.delete({
      where: { id },
    });
  }

  public async getAllGameObjectsByGame(gameId: string) {
    return this.prisma.objectsGame.findMany({
      where: { gameId },
    });
  }

  public async createGameObject(gameId: string, createGameObjectDto: any) {
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
    }

    const tempFilePath = path.join(tmpdir(), `${Date.now()}-gameObject.json`);
    fs.writeFileSync(tempFilePath, JSON.stringify(createGameObjectDto));

    const fileBuffer = fs.readFileSync(tempFilePath);

    const uploadGameObject = await this.minioClientService.uploadJsonFile(
      {
        originalname: 'gameObject.json',
        mimetype: 'application/json',
        buffer: fileBuffer,
        size: fileBuffer.length,
        stream: Readable.from(fileBuffer),
      } as Express.Multer.File,
      game.title,
      'gameObject',
    );

    fs.unlinkSync(tempFilePath);

    return this.prisma.objectsGame.create({
      data: {
        url: `${process.env.MINIO_URL}/${process.env.MINIO_BUCKET}/${uploadGameObject.filename}`,
        game: { connect: { id: gameId } },
      },
    });
  }

  public async updateGameObject(gameId: string, id: string, body: any) {
    const gameObject = await this.prisma.objectsGame.findUnique({
      where: { id },
      include: {
        game: true,
      },
    });

    if (!gameObject) {
      throw new HttpException('Game object not found', HttpStatus.NOT_FOUND);
    }

    const existingFileName = `games/${gameObject.game.title}/${gameObject.url.split('/').pop()}`;

    const tempFilePath = path.join(tmpdir(), `${Date.now()}-gameObject.json`);
    fs.writeFileSync(tempFilePath, JSON.stringify(body));

    const fileBuffer = fs.readFileSync(tempFilePath);

    const uploadGameObject = await this.minioClientService.updateJsonFile(
      {
        originalname: existingFileName || 'gameObject.json',
        mimetype: 'application/json',
        buffer: fileBuffer,
        size: fileBuffer.length,
        stream: Readable.from(fileBuffer),
      } as Express.Multer.File,
      existingFileName,
      gameObject.game.title,
      'gameObject',
    );

    fs.unlinkSync(tempFilePath);

    return this.prisma.objectsGame.update({
      where: { id },
      data: {
        url: `${process.env.MINIO_URL}/${process.env.MINIO_BUCKET}/${uploadGameObject.filename}`,
      },
    });
  }

  public async deleteGameObject(gameId: string, id: string) {
    const gameObject = await this.prisma.objectsGame.findUnique({
      where: { id },
      include: {
        game: true,
      },
    });

    if (!gameObject) {
      throw new HttpException('Game object not found', HttpStatus.NOT_FOUND);
    }

    const existingFileName = `games/${gameObject.game.title}/${gameObject.url.split('/').pop()}`;
    await this.minioClientService.delete(existingFileName);

    return this.prisma.objectsGame.delete({
      where: { id },
    });
  }
}
