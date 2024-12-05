import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../shared/modules/prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class LikeService {
  private readonly logger = new Logger(LikeService.name);

  constructor(private readonly prisma: PrismaService) {}

  async likeGame(user: User, gameId: string) {
    this.logger.log(
      `User ID: ${user.id} attempting to like game ID: ${gameId}`,
    );
    const existingLike = await this.prisma.like.findUnique({
      where: {
        userId_gameId: { userId: user.id, gameId },
      },
    });

    if (existingLike) {
      this.logger.warn(
        `User ID: ${user.id} has already liked game ID: ${gameId}`,
      );
      throw new ForbiddenException('You have already liked this game');
    }

    await this.prisma.like.create({
      data: {
        userId: user.id,
        gameId,
      },
    });

    this.logger.log(`User ID: ${user.id} liked game ID: ${gameId}`);

    await this.prisma.game.update({
      where: { id: gameId },
      data: { likes: { increment: 1 } },
    });
  }

  async unlikeGame(user: User, gameId: string) {
    this.logger.log(
      `User ID: ${user.id} attempting to unlike game ID: ${gameId}`,
    );
    const like = await this.prisma.like.findUnique({
      where: {
        userId_gameId: { userId: user.id, gameId },
      },
    });

    if (!like) {
      this.logger.warn(`User ID: ${user.id} has not liked game ID: ${gameId}`);
      throw new ForbiddenException('You have not liked this game');
    }

    await this.prisma.like.delete({
      where: {
        userId_gameId: { userId: user.id, gameId },
      },
    });

    this.logger.log(`User ID: ${user.id} unliked game ID: ${gameId}`);

    await this.prisma.game.update({
      where: { id: gameId },
      data: { likes: { decrement: 1 } },
    });
  }

  async countLikes(gameId: string) {
    const count = await this.prisma.like.count({
      where: { gameId },
    });
    this.logger.log(`Counted ${count} likes for game ID: ${gameId}`);
    return count;
  }

  async hasLikedGame(userId: string, gameId: string): Promise<boolean> {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_gameId: { userId, gameId },
      },
    });
    return !!like;
  }
}
