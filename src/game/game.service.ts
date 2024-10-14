import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../shared/modules/prisma/prisma.service';
import { GameCreateDto, GameDto, GameUpdateDto } from './game.dto';
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
    return paginate<GameDto, Prisma.GameFindManyArgs>(
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
}
