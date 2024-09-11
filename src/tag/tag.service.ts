import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Tag } from '@prisma/client';
import { TagCreateDto, TagUpdateDto } from './tag.dto';

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService) {}

  public list(): Promise<Partial<Tag>[]> {
    return this.prisma.tag.findMany();
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
