import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/modules/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class LikeService {
  constructor(private readonly prisma: PrismaService) {}

  async likeGame(user: User, gameId: string) {
    const existingLike = await this.prisma.like.findUnique({
      where: {
        userId_gameId: { userId: user.id, gameId },
      },
    });

    if (existingLike) {
      throw new ForbiddenException('You have already liked this game');
    }

    await this.prisma.like.create({
      data: {
        userId: user.id,
        gameId,
      },
    });

    await this.prisma.game.update({
      where: { id: gameId },
      data: { likes: { increment: 1 } },
    });
  }

  async unlikeGame(user: User, gameId: string) {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_gameId: { userId: user.id, gameId },
      },
    });

    if (!like) {
      throw new ForbiddenException('You have not liked this game');
    }

    await this.prisma.like.delete({
      where: {
        userId_gameId: { userId: user.id, gameId },
      },
    });

    await this.prisma.game.update({
      where: { id: gameId },
      data: { likes: { decrement: 1 } },
    });
  }

  async countLikes(gameId: string) {
    return this.prisma.like.count({
      where: { gameId },
    });
  }
}
