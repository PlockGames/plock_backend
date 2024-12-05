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
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { GameService } from './game.service';
import { Game, Media, User } from '@prisma/client';
import {
  GameCreateDto,
  GameDto,
  GameUpdateDto,
  PlayHistoryDto,
  PlayTimeDto,
} from './game.dto';
import { ResponseRequest, responseRequest } from '../shared/utils/response';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Request } from 'express';
import { GameOwnerInterceptor } from '../shared/interceptors/game-owner.interceptor';
import { ApiPaginatedResponse } from '../shared/decorators/pagination.decorator';
import { PaginatedOutputDto } from '../shared/interfaces/pagination';
import { ResponseOneSchema } from '../shared/decorators/response-one.decorator';
import { RecommendationService } from '../recommendation/recommendation.service';
import { ResponseManySchema } from '../shared/decorators/response-many.decorator';
import { memoryStorage } from 'multer';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('Games')
@Controller('game')
export class GameController {
  constructor(
    private readonly gameService: GameService,
    private readonly recommendationService: RecommendationService,
  ) {}

  @Get()
  @ApiPaginatedResponse(GameDto)
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({ status: 200 })
  @ApiOperation({ summary: 'Get all games', description: 'Get all games' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('perPage') perPage: number = 10,
    @Req() req: Request,
  ) {
    const games = await this.gameService.getAllGames(
      page,
      perPage,
      req.user as User,
    );
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
    @Req() req: Request,
  ): Promise<ResponseRequest<Partial<Game>>> {
    const game = await this.gameService.getGame(id, req.user as User);
    return responseRequest<Partial<Game>>('success', 'Game found', game);
  }

  @Get('recommendation')
  @ApiBearerAuth('JWT-auth')
  @ResponseManySchema(GameDto)
  @ApiOperation({
    summary: 'Get recommendations',
    description: 'Get game recommendations',
  })
  async getRecommendations(
    @Req() req: Request,
    @Query('limit') limit: number,
  ): Promise<ResponseRequest<Game[]>> {
    const games = await this.recommendationService.getRecommendations(
      req.user as User,
      limit,
    );
    return responseRequest<Game[]>('success', 'Recommendations found', games);
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

  @Post(':id/playtime')
  @ApiBearerAuth('JWT-auth')
  @ResponseOneSchema(PlayHistoryDto)
  @ApiBody({
    description: 'Playtime details',
    type: PlayTimeDto,
  })
  @ApiOperation({
    summary: 'Record playtime',
    description: 'Record playtime for a game',
  })
  public async recordPlayTime(
    @Req() req: Request,
    @Param('id') gameId: string,
    @Body('playTime') playTime: PlayTimeDto,
  ): Promise<ResponseRequest<Partial<Game>>> {
    await this.gameService.recordPlayTime(req.user as User, gameId, playTime);
    return responseRequest<Partial<Game>>('success', 'Playtime recorded', null);
  }

  @Post(':id/images')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Upload multiple images for a game',
    description: 'Sube múltiples imágenes para un juego específico',
  })
  @ApiBody({
    description: 'List of image files to upload',
    type: 'array',
    schema: {
      type: 'array',
      items: {
        type: 'string',
        format: 'binary',
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: memoryStorage(),
      fileFilter: (req, file, callback) => {
        if (
          file.mimetype.includes('jpeg') ||
          file.mimetype.includes('png') ||
          file.mimetype.includes('gif') ||
          file.mimetype.includes('webp') ||
          file.mimetype.includes('svg')
        ) {
          callback(null, true);
        } else {
          callback(
            new HttpException(
              `Unsupported file type: ${file.mimetype}`,
              HttpStatus.BAD_REQUEST,
            ),
            false,
          );
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  public async uploadImages(
    @Param('id') gameId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<ResponseRequest<Media[]>> {
    if (!files || files.length === 0) {
      throw new HttpException('No files provided', HttpStatus.BAD_REQUEST);
    }

    const media = await this.gameService.uploadGameImages(gameId, files);

    return responseRequest<Media[]>(
      'success',
      'Images uploaded successfully',
      media,
    );
  }
}
