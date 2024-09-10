import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Tag } from '@prisma/client';
import { TagCreateDto, TagUpdateDto } from './tag.dto';

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService) {}

  public list(): Promise<Partial<Tag>[]> {
    return this.prisma.tag.findMany();
  }

  public async get(id: string): Promise<Partial<Tag>> {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });
    if (!tag) throw new NotFoundException('Tag not found');
    return tag;
  }

  public create(tag: TagCreateDto): Promise<Partial<Tag>> {
    return this.prisma.tag.create({
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
