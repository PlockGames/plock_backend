import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { Comment, Prisma, User } from '@prisma/client';
import { PrismaService } from '../shared/modules/prisma/prisma.service';
import { CommentCreateDto, CommentDto, CommentUpdateDto } from './comment.dto';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getAllCommentsForGame(
    idGame: string,
    page: number,
    perPage: number,
    currentUser?: User,
  ) {
    this.logger.log(
      `Retrieving comments for game ID: ${idGame}, Page: ${page}, PerPage: ${perPage}`,
    );
    const paginate = createPaginator({ perPage });

    const comments = await paginate<CommentDto, Prisma.CommentFindManyArgs>(
      this.prisma.comment,
      {
        where: {
          gameId: idGame,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              pofilePic: true,
            },
          },
        },
      },
      {
        page,
      },
    );

    // If there's a current user, check if they are the owner of the game
    let isGameOwner = false;
    if (currentUser) {
      isGameOwner = await this.isUserGameOwner(idGame, currentUser.id);
    }

    // Add isOwner flag to each comment
    const commentsWithOwnerFlag = {
      ...comments,
      data: comments.data.map((comment) => ({
        ...comment,
        isOwner: isGameOwner,
      })),
    };

    this.logger.log(
      `Retrieved ${comments.data.length} comments for game ID: ${idGame}, isGameOwner: ${isGameOwner}`,
    );
    return commentsWithOwnerFlag;
  }

  async isUserGameOwner(gameId: string, userId: string): Promise<boolean> {
    this.logger.log(
      `Checking if user ID: ${userId} is the owner of game ID: ${gameId}`,
    );
    const game = await this.prisma.game.findUnique({
      where: { id: gameId },
      select: { creatorId: true },
    });

    if (!game) {
      this.logger.warn(
        `Game with ID: ${gameId} not found when checking ownership`,
      );
      return false;
    }

    const isOwner = game.creatorId === userId;
    this.logger.log(
      `User ID: ${userId} is ${isOwner ? '' : 'not '}the owner of game ID: ${gameId}`,
    );
    return isOwner;
  }

  async get(id: string): Promise<Comment> {
    this.logger.log(`Retrieving comment with ID: ${id}`);
    const comment = await this.prisma.comment.findUnique({
      where: { id },
    });
    this.logger.log(`Comment retrieved: ${JSON.stringify(comment)}`);
    return comment;
  }

  async create(user, idGame, commentDto: CommentCreateDto): Promise<Comment> {
    this.logger.log(
      `Creating comment for game ID: ${idGame} by user ID: ${user.id}`,
    );
    const commentCreated = await this.prisma.comment.create({
      data: {
        ...commentDto,
        user: {
          connect: {
            id: user.id,
          },
        },
        game: {
          connect: {
            id: idGame,
          },
        },
      },
    });
    this.logger.log(`Comment created with ID: ${commentCreated.id}`);
    return commentCreated;
  }

  async update(id: string, data: CommentUpdateDto): Promise<Comment> {
    this.logger.log(`Updating comment ID: ${id}`);
    const commentUpdated = await this.prisma.comment.update({
      where: { id },
      data,
    });
    this.logger.log(`Comment updated with ID: ${id}`);
    return commentUpdated;
  }

  async delete(id: string, user: User): Promise<Comment> {
    this.logger.log(`Deleting comment ID: ${id} by user ID: ${user.id}`);

    // Find the comment first to get the gameId
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      select: { gameId: true },
    });

    if (!comment) {
      this.logger.warn(
        `Comment with ID: ${id} not found when attempting to delete`,
      );
      throw new ForbiddenException('Comment not found');
    }

    // Check if the user is the owner of the game
    const isOwner = await this.isUserGameOwner(comment.gameId, user.id);

    if (!isOwner) {
      this.logger.warn(
        `User ID: ${user.id} is not the owner of the game, cannot delete comment ID: ${id}`,
      );
      throw new ForbiddenException('Only the game owner can delete comments');
    }

    const commentDeleted = await this.prisma.comment.delete({
      where: { id },
    });

    this.logger.log(`Comment deleted with ID: ${id} by game owner: ${user.id}`);
    return commentDeleted;
  }
}
