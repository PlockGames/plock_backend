import { Injectable, Logger } from '@nestjs/common';
import { Comment, Prisma } from '@prisma/client';
import { PrismaService } from '../shared/modules/prisma/prisma.service';
import { CommentCreateDto, CommentDto, CommentUpdateDto } from './comment.dto';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class CommentService {
  private readonly logger = new Logger(CommentService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getAllCommentsForGame(idGame: string, page: number, perPage: number) {
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
      },
      {
        page,
      },
    );

    this.logger.log(
      `Retrieved ${comments.data.length} comments for game ID: ${idGame}`,
    );
    return comments;
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

  async delete(id: string): Promise<Comment> {
    this.logger.log(`Deleting comment ID: ${id}`);
    const commentDeleted = await this.prisma.comment.delete({
      where: { id },
    });
    this.logger.log(`Comment deleted with ID: ${id}`);
    return commentDeleted;
  }
}
