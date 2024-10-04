import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../shared/modules/prisma/prisma.service';
import { GameCreateDto, GameUpdateDto } from './game.dto';
import { v4 as uuidv4 } from 'uuid';
import { R2Service } from '../shared/modules/r2/r2.service';

@Injectable()
export class GameService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly r2Service: R2Service,
  ) {}

  public async get(id: string) {
    return this.prisma.game.findUnique({
      where: { id },
    });
  }

  public async create(user: User, game: GameCreateDto) {
    return this.prisma.game.create({
      data: {
        title: game.title,
        gameUrl: game.gameUrl,
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

  public async update(id: string, data: GameUpdateDto) {
    return this.prisma.game.update({
      where: { id },
      data,
    });
  }

  public async delete(id: string) {
    return this.prisma.game.delete({
      where: { id },
    });
  }

  // toCheck
  public async createWinCondition(gameId: string, createWinConditionDto: any) {
    const key = `game-${gameId}/winConditions/${uuidv4()}`;
    return this.r2Service.uploadFile(
      'plock-games',
      key,
      JSON.stringify(createWinConditionDto),
    );
  }

  public async getAllWinConditionsByGame(gameId: string) {
    const prefix = `game-${gameId}/winConditions/`;
    const keys = await this.r2Service.listFiles('plock-games', prefix);
    const winConditions = await Promise.all(
      keys.map(async (key) => {
        const file = await this.r2Service.getFile('plock-games', key);
        const body = JSON.parse(file.Body.toString());
        return { key, ...body };
      }),
    );
    return winConditions;
  }

  public async deleteWinCondition(gameId: string, id: string) {
    const key = `game-${gameId}/winConditions/${id}`;
    return this.r2Service.deleteFile('plock-games', key);
  }

  public async updateWinCondition(gameId: string, id: string, body: any) {
    const key = `game-${gameId}/winConditions/${id}`;
    return this.r2Service.updateFile('plock-games', key, JSON.stringify(body));
  }

  public async createGameObject(gameId: string, createGameObjectDto: any) {
    try {
      const key = `game-${gameId}/gameObjects/${uuidv4()}`;
      return await this.r2Service.uploadFile(
        'plock-games',
        key,
        JSON.stringify(createGameObjectDto),
      );
    } catch (error) {
      throw new HttpException(
        `Failed to create game object: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async getAllGameObjectsByGame(gameId: string) {
    try {
      const prefix = `game-${gameId}/gameObjects/`;
      const keys = await this.r2Service.listFiles('plock-games', prefix);
      const gameObjects = await Promise.all(
        keys.map(async (key) => {
          const file = await this.r2Service.getFile('plock-games', key);
          const body = JSON.parse(file.Body.toString());
          return { key, ...body };
        }),
      );
      return gameObjects;
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve game objects: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async deleteGameObject(gameId: string, id: string) {
    try {
      const key = `game-${gameId}/gameObjects/${id}`;
      return await this.r2Service.deleteFile('plock-games', key);
    } catch (error) {
      throw new HttpException(
        `Failed to delete game object: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async updateGameObject(gameId: string, id: string, body: any) {
    try {
      const key = `game-${gameId}/gameObjects/${id}`;
      return await this.r2Service.updateFile(
        'plock-games',
        key,
        JSON.stringify(body),
      );
    } catch (error) {
      throw new HttpException(
        `Failed to update game object: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
