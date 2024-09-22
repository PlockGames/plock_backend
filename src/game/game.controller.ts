import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { GameService } from './game.service';
import { Game, User } from '@prisma/client';
import { GameCreateDto, GameUpdateDto } from './game.dto';
import { ResponseRequest, responseRequest } from '../shared/utils/response';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateGameResponse,
  UpdateGameResponse,
  DeleteGameResponse,
} from '../shared/swagger/responses';
import { Request } from 'express';
import { GameOwnerInterceptor } from '../shared/interceptors/game-owner.interceptor';

@ApiTags('Games')
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiResponse(CreateGameResponse)
  @ApiBody({
    description: 'Game details',
    type: GameCreateDto,
  })
  @ApiOperation({ summary: 'Create game', description: 'Create a new game' })
  public async create(
    @Body() game: GameCreateDto,
    @Req() req: Request,
  ): Promise<ResponseRequest<Partial<Game>>> {
    const gameCreated = await this.gameService.create(req.user as User, game);
    return responseRequest<Partial<Game>>(
      'success',
      'Game created',
      gameCreated,
    );
  }

  @Put(':id')
  @UseInterceptors(GameOwnerInterceptor)
  @ApiBearerAuth('JWT-auth')
  @ApiResponse(UpdateGameResponse)
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
    const gameUpdated = await this.gameService.update(id, game);
    return responseRequest<Partial<Game>>(
      'success',
      'Game updated',
      gameUpdated,
    );
  }

  @Delete(':id')
  @UseInterceptors(GameOwnerInterceptor)
  @ApiBearerAuth('JWT-auth')
  @ApiResponse(DeleteGameResponse)
  @ApiOperation({ summary: 'Delete game', description: 'Delete a game' })
  public async delete(
    @Param('id') id: string,
  ): Promise<ResponseRequest<Partial<Game>>> {
    const gameDeleted = await this.gameService.delete(id);
    return responseRequest<Partial<Game>>(
      'success',
      'Game deleted',
      gameDeleted,
    );
  }
}
