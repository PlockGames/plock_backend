import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Put,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { R2Service } from '../../r2/r2.service';
import { v4 as uuidv4 } from 'uuid';

/**
 * Controller to manage game objects associated with a specific game.
 */
@Controller('games/:gameId/gameObjects')
export class GameObjectsController {
  constructor(private readonly r2Service: R2Service) {}

  /**
   * Creates a new game object for a specified game.
   * @param {string} gameId - The ID of the game.
   * @param {any} body - The data of the game object to be created.
   * @returns {Promise<any>} - The result of the upload operation.
   */
  @Post()
  async createGameObject(@Param('gameId') gameId: string, @Body() body: any) {
    try {
      const key = `game-${gameId}/gameObjects/${uuidv4()}`;
      return await this.r2Service.uploadFile(
        'plock-games',
        key,
        JSON.stringify(body),
      );
    } catch (error) {
      throw new HttpException(
        `Failed to create game object: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Retrieves all game objects associated with a specified game.
   * @param {string} gameId - The ID of the game.
   * @returns {Promise<any[]>} - A list of game objects.
   */
  @Get()
  async getAllGameObjectsByGame(@Param('gameId') gameId: string) {
    try {
      const prefix = `game-${gameId}/gameObjects/`;
      const keys = await this.r2Service.listFiles('plock-games', prefix);
      const gameObjects = await Promise.all(
        keys.map(async (key) => {
          const file = await this.r2Service.getFile('plock-games', key);
          const body = JSON.parse(file.Body.toString()); // Convert Buffer to string and parse JSON
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

  /**
   * Deletes a specific game object associated with a specified game.
   * @param {string} gameId - The ID of the game.
   * @param {string} id - The ID of the game object to be deleted.
   * @returns {Promise<any>} - The result of the delete operation.
   */
  @Delete(':id')
  async deleteGameObject(
    @Param('gameId') gameId: string,
    @Param('id') id: string,
  ) {
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

  /**
   * Updates a specific game object associated with a specified game.
   * @param {string} gameId - The ID of the game.
   * @param {string} id - The ID of the game object to be updated.
   * @param {any} body - The new data for the game object.
   * @returns {Promise<any>} - The result of the update operation.
   */
  @Put(':id')
  async updateGameObject(
    @Param('gameId') gameId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
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
