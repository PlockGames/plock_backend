import { Injectable } from '@nestjs/common';
import { Comment, Prisma } from '@prisma/client';
import { PrismaService } from '../shared/modules/prisma/prisma.service';
import { CommentCreateDto, CommentDto, CommentUpdateDto } from './comment.dto';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllCommentsForGame(idGame: string, page: number, perPage: number) {
    const paginate = createPaginator({ perPage });
    return paginate<CommentDto, Prisma.CommentFindManyArgs>(
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
  }

  async get(id: string): Promise<Comment> {
    return this.prisma.comment.findUnique({
      where: { id },
    });
  }

  async create(user, idGame, commentDto: CommentCreateDto): Promise<Comment> {
    return this.prisma.comment.create({
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
  }

  async update(id: string, data: CommentUpdateDto): Promise<Comment> {
    return this.prisma.comment.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Comment> {
    return this.prisma.comment.delete({
      where: { id },
    });
  }
}
