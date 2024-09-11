import { ForbiddenException, Injectable } from '@nestjs/common';
import { Comment } from '@prisma/client';
import { PrismaService } from '../shared/modules/prisma/prisma.service';
import { CommentCreateDto, CommentUpdateDto } from './comment.dto';

@Injectable()
export class CommentService {
  constructor(private readonly prisma: PrismaService) {}

  async get(id: string): Promise<Comment> {
    return this.prisma.comment.findUnique({
      where: { id },
    });
  }

  async create(user, idPost, commentDto: CommentCreateDto): Promise<Comment> {
    return this.prisma.comment.create({
      data: {
        ...commentDto,
        user: {
          connect: {
            id: user.id,
          },
        },
        post: {
          connect: {
            id: idPost,
          },
        },
      },
    });
  }

  async update(user, id: string, data: CommentUpdateDto): Promise<Comment> {
    const comment = await this.get(id);
    if (comment.userId !== user.id) {
      throw new ForbiddenException(
        'You are not allowed to update this comment',
      );
    }
    return this.prisma.comment.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Comment> {
    const comment = await this.get(id);

    if (!comment) {
      throw new ForbiddenException('Comment not found');
    }
    return this.prisma.comment.delete({
      where: { id },
    });
  }
}
