import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/modules/prisma/prisma.service';
import { CreatePostDto, UpdatePostDto } from './post.dto';
import { User } from '@prisma/client';
import { MinioClientService } from '../shared/modules/minio-client/minio-client.service';

@Injectable()
export class PostService {
  constructor(
    private prisma: PrismaService,
    private minioClientService: MinioClientService,
  ) {}

  public async get(id: string) {
    return this.prisma.post.findUnique({
      where: { id },
    });
  }

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
      },
    });
  }

  public async updatePost(user: User, postId: string, postDto: UpdatePostDto) {
    return this.prisma.post.update({
      where: { id: postId },
      data: {
        content: postDto.content,
        tags: { deleteMany: {}, create: postDto.tags },
      },
    });
  }

  public async deletePost(user: User, postId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: { media: true },
    });
    await this.minioClientService.delete(post.media[0].filename);
    if (post.media[0].thumbnailFileName) {
      await this.minioClientService.delete(post.media[0].thumbnailFileName);
    }
    return this.prisma.post.delete({
      where: { id: postId },
    });
  }
}
