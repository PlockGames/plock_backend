import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * @class GamesController
 * @description Controller for handling game related routes
 */
@Controller('games')
export class GamesController {
  constructor() {} // Inject Prisma service

  /**
   * @method getAllGames
   * @description Route handler to get all games
   * @returns {Promise} Returns a promise that resolves with all games
   */
  @Get()
  async getAllGames() {
    return prisma.game.findMany();
  }

  /**
   * @method getGameById
   * @description Route handler to get a specific game by ID
   * @param {string} id - The id of the game
   * @returns {Promise} Returns a promise that resolves with the game object
   */
  @Get(':id')
  async getGameById(@Param('id') id: string) {
    return prisma.game.findUnique({ where: { id: parseInt(id) } });
  }

  /**
   * @method createGame
   * @description Route handler to create a new game
   * @param {Object} gameData - The data of the game to be created
   * @returns {Promise} Returns a promise that resolves with the created game object
   */
  @Post()
  async createGame(@Body() gameData: any) {
    return prisma.game.create({ data: gameData });
  }

  /**
   * @method updateGame
   * @description Route handler to update an existing game
   * @param {string} id - The id of the game to be updated
   * @param {Object} gameData - The new data of the game
   * @returns {Promise} Returns a promise that resolves with the updated game object
   */
  @Put(':id')
  async updateGame(@Param('id') id: string, @Body() gameData: any) {
    return prisma.game.update({ where: { id: parseInt(id) }, data: gameData });
  }

  /**
   * @method deleteGame
   * @description Route handler to delete a game
   * @param {string} id - The id of the game to be deleted
   * @returns {Promise} Returns a promise that resolves when the game is deleted
   */
  @Delete(':id')
  async deleteGame(@Param('id') id: string) {
    return prisma.game.delete({ where: { id: parseInt(id) } });
  }
}
