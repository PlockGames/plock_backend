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
import { LikeDto } from './like.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { User } from '@prisma/client';

@ApiTags('Likes')
@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Get('count/:gameId')
  @ApiOperation({
    summary: 'Count likes',
    description: 'Count the total likes for a game',
  })
  @ApiResponse({
    status: 200,
    description: 'Total likes retrieved successfully',
  })
  async countLikes(@Param('gameId') gameId: string) {
    const totalLikes = await this.likeService.countLikes(gameId);
    return { status: 'success', totalLikes };
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Like a game',
    description: 'Like a game by its ID',
  })
  @ApiResponse({ status: 201, description: 'Game liked successfully' })
  @ApiResponse({ status: 400, description: 'User already liked this game' })
  async likeGame(@Body() likeDto: LikeDto, @Req() req: Request) {
    await this.likeService.likeGame(req.user as User, likeDto.gameId);
    return { status: 'success', message: 'Game liked successfully' };
  }

  @Delete(':gameId')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Unlike a game',
    description: 'Unlike a game by its ID',
  })
  @ApiResponse({ status: 200, description: 'Game unliked successfully' })
  @ApiResponse({ status: 400, description: 'User has not liked this game' })
  async unlikeGame(@Param('gameId') gameId: string, @Req() req: Request) {
    await this.likeService.unlikeGame(req.user as User, gameId);
    return { status: 'success', message: 'Game unliked successfully' };
  }
}
