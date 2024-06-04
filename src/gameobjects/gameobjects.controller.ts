// GameObject Controller
import { Controller, Get, Post, Delete, Param, Body, Put } from '@nestjs/common';
import { R2Service } from '../services/r2/r2.service';
import { v4 as uuidv4 } from 'uuid';

@Controller('games/:gameId/gameObjects')
export class GameObjectsController {
    constructor(private readonly r2Service: R2Service) { }

    @Post()
    async createGameObject(@Param('gameId') gameId: string, @Body() body: any) {
        const key = `game-${gameId}/gameObjects/${uuidv4()}`;
        return this.r2Service.uploadFile('plock-games', key, JSON.stringify(body));
    }

    @Get()
    async getAllGameObjectsByGame(@Param('gameId') gameId: string) {
        const prefix = `game-${gameId}/gameObjects/`;
        const keys = await this.r2Service.listFiles('plock-games', prefix);
        const gameObjects = await Promise.all(keys.map(async key => {
            const file = await this.r2Service.getFile('plock-games', key);
            const body = JSON.parse(file.Body.toString()); // Convert Buffer to string and parse JSON
            return { key, ...body };
        }));
        return gameObjects;
    }

    @Delete(':id')
    async deleteGameObject(@Param('gameId') gameId: string, @Param('id') id: string) {
        const key = `game-${gameId}/gameObjects/${id}`;
        return this.r2Service.deleteFile('plock-games', key);
    }

    @Put(':id')
    async updateGameObject(@Param('gameId') gameId: string, @Param('id') id: string, @Body() body: any) {
        const key = `game-${gameId}/gameObjects/${id}`;
        return this.r2Service.updateFile('plock-games', key, JSON.stringify(body));
    }
}