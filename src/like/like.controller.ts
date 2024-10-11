import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeDto, LikeResponseDto } from './like.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { User } from '@prisma/client';
import { ResponseOneSchema } from 'src/shared/decorators/response-one.decorator';

@ApiTags('Likes')
@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Get('count/:gameId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Count likes',
    description: 'Count the total likes for a game',
  })
  @ResponseOneSchema(LikeResponseDto)
  async countLikes(@Param('gameId') gameId: string) {
    const totalLikes = await this.likeService.countLikes(gameId);
    return { status: 'success', totalLikes };
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiBearerAuth('JWT-auth')
  @ResponseOneSchema(LikeResponseDto)
  @ApiResponse({ status: 201, description: 'Game liked successfully' })
  @ApiResponse({ status: 400, description: 'User already liked this game' })
  async likeGame(@Body() likeDto: LikeDto, @Req() req: Request) {
    await this.likeService.likeGame(req.user as User, likeDto.gameId);
    return { status: 'success', message: 'Game liked successfully' };
  }

  @Delete(':gameId')
  @ApiBearerAuth('JWT-auth')
  @ResponseOneSchema(LikeResponseDto)
  @ApiResponse({ status: 200, description: 'Game unliked successfully' })
  @ApiResponse({ status: 400, description: 'User has not liked this game' })
  async unlikeGame(@Param('gameId') gameId: string, @Req() req: Request) {
    await this.likeService.unlikeGame(req.user as User, gameId);
    return { status: 'success', message: 'Game unliked successfully' };
  }
}
