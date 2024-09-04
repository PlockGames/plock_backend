import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateGameDto, UpdateGameDto } from '../dto/game.dto';
import { R2Service } from '../r2/r2.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * @class GamesController
 * @description Controller for handling game related routes
 */
@Controller('games')
export class GamesController {
  constructor(
    private readonly r2Service: R2Service,
    private prisma: PrismaService,
  ) {} // Inject Prisma service

  /**
   * @method getAllGames
   * @description Route handler to get all games sorted by creation date (most recent first)
   * @returns {Promise} Returns a promise that resolves with all games
   */
  @Get()
  async getAllGames(@Query('page') page?: number) {
    try {
      if (page) {
        return await this.prisma.game.findMany({
          orderBy: {
            creationDate: 'desc',
          },
          skip: (page - 1) * 3,
          take: 3,
        });
      }
      return await this.prisma.game.findMany({
        orderBy: {
          creationDate: 'desc',
        },
      });
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve games: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * @method getGameById
   * @description Route handler to get a specific game by ID
   * @param {string} id - The id of the game
   * @returns {Promise} Returns a promise that resolves with the game object
   */
  @Get(':id')
  async getGameById(@Param('id') id: string) {
    try {
      const game = await this.prisma.game.findUnique({
        where: { id: parseInt(id) },
      });
      if (!game) {
        throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
      }
      return game;
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve game: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * @method getGameWithDataById
   * @description Route handler to get a specific game by ID
   * @param {string} id - The id of the game
   * @returns {Promise} Returns a promise that resolves with the game
   */
  @Get('full/:id')
  async getGameWithDataById(@Param('id') id: string) {
    try {
      const game = await this.prisma.game.findUnique({
        where: { id: parseInt(id) },
      });
      if (!game) {
        throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
      }
      const data = await this.r2Service.getFile('plock-games', game.gameUrl);

      return {
        ...game,
        data: data.Body.toString(),
      };
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve game: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * @method createGame
   * @description Route handler to create a new game
   * @param {Object} gameData - The data of the game to be created
   * @returns {Promise} Returns a promise that resolves with the created game object
   */
  @Post()
  async createGame(@Body() gameData: CreateGameDto) {
    try {
      const uid = crypto.randomUUID();
      await this.r2Service.uploadFile(
        'plock-games',
        uid + '.json',
        gameData.data,
      );

      return await this.prisma.game.create({
        data: {
          title: gameData.title,
          tags: gameData.tags,
          creatorId: gameData.creatorId,
          creationDate: new Date(),
          gameUrl: uid + '.json',
          playTime: gameData.playTime,
          gameType: gameData.gameType,
          thumbnailUrl: gameData.thumbnailUrl,
          likes: 0,
        },
      });
    } catch (error) {
      throw new HttpException(
        `Failed to create game: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * @method updateGame
   * @description Route handler to update an existing game
   * @param {string} id - The id of the game to be updated
   * @param {Object} gameData - The new data of the game
   * @returns {Promise} Returns a promise that resolves with the updated game object
   */
  @Put(':id')
  async updateGame(@Param('id') id: string, @Body() gameData: UpdateGameDto) {
    try {
      const uid = crypto.randomUUID();
      const game = await this.prisma.game.findUnique({
        where: { id: parseInt(id) },
      });
      this.r2Service.deleteFile('plock-games', game.gameUrl);
      await this.r2Service.uploadFile(
        'plock-games',
        uid + '.json',
        gameData.data,
      );

      return await this.prisma.game.update({
        where: { id: parseInt(id) },
        data: {
          title: gameData.title,
          tags: gameData.tags,
          creatorId: gameData.creatorId,
          gameUrl: uid + '.json',
          playTime: gameData.playTime,
          gameType: gameData.gameType,
          thumbnailUrl: gameData.thumbnailUrl,
          likes: gameData.likes,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        // Prisma error code for record not found
        throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        `Failed to update game: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * @method deleteGame
   * @description Route handler to delete a game
   * @param {string} id - The id of the game to be deleted
   * @returns {Promise} Returns a promise that resolves when the game is deleted
   */
  @Delete(':id')
  async deleteGame(@Param('id') id: string) {
    try {
      const game = await this.prisma.game.findUnique({
        where: { id: parseInt(id) },
      });
      this.r2Service.deleteFile('plock-games', game.gameUrl);
      return await this.prisma.game.delete({ where: { id: parseInt(id) } });
    } catch (error) {
      if (error.code === 'P2025') {
        // Prisma error code for record not found
        throw new HttpException('Game not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        `Failed to delete game: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
