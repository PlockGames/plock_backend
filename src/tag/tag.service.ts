import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../shared/modules/prisma/prisma.service';
import { Prisma, Tag } from '@prisma/client';
import { TagCreateDto, TagDto, TagUpdateDto } from './tag.dto';
import { createPaginator } from 'prisma-pagination';

@Injectable()
export class TagService {
  private readonly logger = new Logger(TagService.name);

  constructor(private prisma: PrismaService) {}

  public list(page: number, perPage: number) {
    this.logger.log(`Listing tags - Page: ${page}, Per Page: ${perPage}`);
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
    this.logger.log(`Creating tag with name: ${tag.name}`);
    const existingTag = await this.prisma.tag.findUnique({
      where: { name: tag.name },
    });
    if (existingTag) {
      this.logger.warn(`Tag with name "${tag.name}" already exists.`);
      throw new ForbiddenException(
        `A tag with the name "${tag.name}" already exists.`,
      );
    }

    const createdTag = await this.prisma.tag.create({
      data: tag,
    });

    this.logger.log(`Tag created: ${JSON.stringify(createdTag)}`);
    return createdTag;
  }

  public async update(id: string, tag: TagUpdateDto): Promise<Partial<Tag>> {
    this.logger.log(`Updating tag ID: ${id}`);
    const updatedTag = await this.prisma.tag.update({
      where: { id },
      data: tag,
    });

    this.logger.log(`Tag updated: ${JSON.stringify(updatedTag)}`);
    return updatedTag;
  }

  public async delete(id: string): Promise<Partial<Tag>> {
    this.logger.log(`Deleting tag ID: ${id}`);
    const deletedTag = await this.prisma.tag.delete({
      where: { id },
    });

    this.logger.log(`Tag deleted: ${JSON.stringify(deletedTag)}`);
    return deletedTag;
  }
}
