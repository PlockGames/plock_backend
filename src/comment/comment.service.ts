import { Injectable } from '@nestjs/common';
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
