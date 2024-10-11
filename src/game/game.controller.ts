import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { GameService } from './game.service';
import { Game, User } from '@prisma/client';
import { GameCreateDto, GameDto, GameUpdateDto } from './game.dto';
import { ResponseRequest, responseRequest } from '../shared/utils/response';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Request } from 'express';
import { GameOwnerInterceptor } from '../shared/interceptors/game-owner.interceptor';
import { ApiPaginatedResponse } from '../shared/decorators/pagination.decorator';
import { PaginatedOutputDto } from '../shared/interfaces/pagination';
import { ResponseOneSchema } from '../shared/decorators/response-one.decorator';

@ApiTags('Games')
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get()
  @ApiPaginatedResponse(GameDto)
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200 })
  @ApiOperation({ summary: 'Get all games', description: 'Get all games' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('perPage') perPage: number = 10,
  ) {
    const games = await this.gameService.getAllGames(page, perPage);
    return responseRequest<PaginatedOutputDto<GameDto>>(
      'success',
      'Game found',
      games,
    );
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ResponseOneSchema(GameDto)
  @ApiOperation({ summary: 'Get game', description: 'Get a game by id' })
  public async getGame(
    @Param('id') id: string,
  ): Promise<ResponseRequest<Partial<Game>>> {
    const game = await this.gameService.getGame(id);
    return responseRequest<Partial<Game>>('success', 'Game found', game);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ResponseOneSchema(GameDto)
  @ApiBody({
    description: 'Game details',
    type: GameCreateDto,
  })
  @ApiOperation({ summary: 'Create game', description: 'Create a new game' })
  public async create(
    @Body() game: GameCreateDto,
    @Req() req: Request,
  ): Promise<ResponseRequest<Partial<Game>>> {
    const gameCreated = await this.gameService.createGame(
      req.user as User,
      game,
    );
    return responseRequest<Partial<Game>>(
      'success',
      'Game created',
      gameCreated,
    );
  }

  @Put(':id')
  @UseInterceptors(GameOwnerInterceptor)
  @ApiBearerAuth('JWT-auth')
  @ResponseOneSchema(GameDto)
  @ApiBody({
    description: 'Game details',
    type: GameUpdateDto,
  })
  @ApiOperation({
    summary: 'Update game',
    description: 'Update an existing game',
  })
  public async update(
    @Param('id') id: string,
    @Body() game: GameUpdateDto,
  ): Promise<ResponseRequest<Partial<Game>>> {
    const gameUpdated = await this.gameService.updateGame(id, game);
    return responseRequest<Partial<Game>>(
      'success',
      'Game updated',
      gameUpdated,
    );
  }

  @Delete(':id')
  @UseInterceptors(GameOwnerInterceptor)
  @ApiBearerAuth('JWT-auth')
  @ResponseOneSchema(GameDto)
  @ApiOperation({ summary: 'Delete game', description: 'Delete a game' })
  public async delete(
    @Param('id') id: string,
  ): Promise<ResponseRequest<Partial<Game>>> {
    const gameDeleted = await this.gameService.deleteGame(id);
    return responseRequest<Partial<Game>>(
      'success',
      'Game deleted',
      gameDeleted,
    );
  }

  //toremove
  @Post('win-conditions/:gameId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create win condition',
    description: 'Create a win condition',
  })
  @ApiParam({ name: 'gameId', description: 'Game id' })
  @ApiBody({
    description: 'Win condition details',
    type: Object,
  })
  public async createWinCondition(
    @Param('gameId') gameId: string,
    @Body() body: any,
  ) {
    const winCondition = await this.gameService.createWinCondition(
      gameId,
      body,
    );
    return responseRequest('success', 'Win condition created', winCondition);
  }

  @Get('win-conditions/:gameId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all win conditions',
    description: 'Get all win conditions by game',
  })
  @ApiParam({ name: 'gameId', description: 'Game id' })
  public async getAllWinConditionsByGame(@Param('gameId') gameId: string) {
    const allWinConditions =
      await this.gameService.getAllWinConditionsByGame(gameId);
    return responseRequest('success', 'All win conditions', allWinConditions);
  }

  @Delete('win-conditions/:gameId/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete win condition',
    description: 'Delete a win condition by id',
  })
  @ApiParam({ name: 'gameId', description: 'Game id' })
  @ApiParam({ name: 'id', description: 'Win condition id' })
  public async deleteWinCondition(
    @Param('gameId') gameId: string,
    @Param('id') id: string,
  ) {
    const deletedWinCondition = await this.gameService.deleteWinCondition(
      gameId,
      id,
    );
    return responseRequest(
      'success',
      'Win condition deleted',
      deletedWinCondition,
    );
  }

  @Put('win-conditions/:gameId/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update win condition',
    description: 'Update a win condition by id',
  })
  @ApiParam({ name: 'gameId', description: 'Game id' })
  @ApiParam({ name: 'id', description: 'Win condition id' })
  @ApiBody({
    description: 'Win condition details',
    type: Object,
  })
  public async updateWinCondition(
    @Param('gameId') gameId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const updatedWinCondition = await this.gameService.updateWinCondition(
      gameId,
      id,
      body,
    );
    return responseRequest(
      'success',
      'Win condition updated',
      updatedWinCondition,
    );
  }

  @Post('game-objects/:gameId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create game object',
    description: 'Create a game object',
  })
  @ApiParam({ name: 'gameId', description: 'Game id' })
  @ApiBody({
    description: 'Game object details',
    type: Object,
  })
  public async createGameObject(
    @Param('gameId') gameId: string,
    @Body() body: any,
  ) {
    const gameObject = await this.gameService.createGameObject(gameId, body);
    return responseRequest('success', 'Game object created', gameObject);
  }

  @Get('game-objects/:gameId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all game objects',
    description: 'Get all game objects by game',
  })
  @ApiParam({ name: 'gameId', description: 'Game id' })
  public async getAllGameObjectsByGame(@Param('gameId') gameId: string) {
    const allGameObjects =
      await this.gameService.getAllGameObjectsByGame(gameId);
    return responseRequest('success', 'All game objects', allGameObjects);
  }

  @Delete('game-objects/:gameId/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete game object',
    description: 'Delete a game object by id',
  })
  @ApiParam({ name: 'gameId', description: 'Game id' })
  @ApiParam({ name: 'id', description: 'Game object id' })
  public async deleteGameObject(
    @Param('gameId') gameId: string,
    @Param('id') id: string,
  ) {
    const deletedGameObject = await this.gameService.deleteGameObject(
      gameId,
      id,
    );
    return responseRequest('success', 'Game object deleted', deletedGameObject);
  }

  @Put('game-objects/:gameId/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update game object',
    description: 'Update a game object by id',
  })
  @ApiParam({ name: 'gameId', description: 'Game id' })
  @ApiParam({ name: 'id', description: 'Game object id' })
  @ApiBody({
    description: 'Game object details',
    type: Object,
  })
  public async updateGameObject(
    @Param('gameId') gameId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    const updatedGameObject = await this.gameService.updateGameObject(
      gameId,
      id,
      body,
    );
    return responseRequest('success', 'Game object updated', updatedGameObject);
  }
}
