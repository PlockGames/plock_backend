import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto, UpdatePostDto } from './post.dto';
import { User } from '@prisma/client';
import { MinioClientService } from '../minio-client/minio-client.service';

@Injectable()
export class PostService {
  constructor(
    private prisma: PrismaService,
    private minioClientService: MinioClientService,
  ) {}

  public async createPost(
    user: User,
    postDto: CreatePostDto,
    media: Express.Multer.File,
  ) {
    const { filename, thumbnailFileName } =
      await this.minioClientService.upload(media, false);
    return this.prisma.post.create({
      data: {
        content: postDto.content,
        userId: user.id,
        location: postDto.location,
        media: {
          create: {
            filename,
            thumbnailFileName,
            mimetype: media.mimetype,
            name: media.originalname,
            size: media.size,
            userId: user.id,
          },
        },
        tags: { create: postDto.tags },
      },
    });
  }

  public async updatePost(user: User, postId: string, postDto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });
    if (!post || post.userId !== user.id) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    return this.prisma.post.update({
      where: { id: postId },
      data: {
        content: postDto.content,
        location: postDto.location,
        tags: { deleteMany: {}, create: postDto.tags },
      },
    });
  }

  public async deletePost(user: User, postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });
    if (!post || post.userId !== user.id) {
      throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    return this.prisma.post.delete({
      where: { id: postId },
    });
  }
}
