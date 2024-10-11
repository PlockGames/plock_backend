import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/modules/prisma/prisma.service';
import { Prisma, Tag } from '@prisma/client';
import { TagCreateDto, TagDto, TagUpdateDto } from './tag.dto';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService) {}

  public list(page: number, perPage: number) {
    const paginate = createPaginator({ perPage });
    return paginate<TagDto, Prisma.TagFindManyArgs>(
      this.prisma.tag,
      {},
      {
        page,
      },
    );
  }

  public async create(tag: TagCreateDto): Promise<Partial<Tag>> {
    const existingTag = await this.prisma.tag.findUnique({
      where: { name: tag.name },
    });
    if (existingTag) {
      throw new ForbiddenException(
        `A tag with the name "${tag.name}" already exists.`,
      );
    }
    return await this.prisma.tag.create({
      data: tag,
    });
  }

  public update(id: string, tag: TagUpdateDto): Promise<Partial<Tag>> {
    return this.prisma.tag.update({
      where: { id },
      data: tag,
    });
  }

  public delete(id: string): Promise<Partial<Tag>> {
    return this.prisma.tag.delete({
      where: { id },
    });
  }
}
