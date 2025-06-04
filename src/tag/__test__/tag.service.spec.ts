// tag.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { TagService } from '../tag.service';
import { PrismaService } from '../../shared/modules/prisma/prisma.service';
import { ForbiddenException } from '@nestjs/common';
import { TagCreateDto, TagUpdateDto } from '../tag.dto';

describe('TagService', () => {
  let service: TagService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagService,
        {
          provide: PrismaService,
          useValue: {
            tag: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TagService>(TagService);
    prismaService = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('should return a list of tags', async () => {
      const mockTags = [{ id: '1', name: 'Tag1' }];
      prismaService.tag.findMany = jest.fn().mockResolvedValue(mockTags);
      prismaService.tag.count = jest.fn().mockResolvedValue(1);

      const result = await service.list(1, 10);

      expect(prismaService.tag.findMany).toHaveBeenCalled();
      expect(prismaService.tag.count).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.data).toEqual(mockTags);
    });
  });

  describe('create', () => {
    it('should create a new tag', async () => {
      const tagDto: TagCreateDto = {
        name: 'New Tag',
      };

      prismaService.tag.findUnique = jest.fn().mockResolvedValue(null);
      prismaService.tag.create = jest.fn().mockResolvedValue({
        id: 'tag1',
        ...tagDto,
      });

      const result = await service.create(tagDto);

      expect(prismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { name: tagDto.name },
      });
      expect(prismaService.tag.create).toHaveBeenCalledWith({
        data: tagDto,
      });
      expect(result).toBeDefined();
      expect(result.name).toEqual(tagDto.name);
    });

    it('should throw an error if tag already exists', async () => {
      const tagDto: TagCreateDto = {
        name: 'Existing Tag',
      };

      prismaService.tag.findUnique = jest
        .fn()
        .mockResolvedValue({ id: 'tag1', name: 'Existing Tag' });

      await expect(service.create(tagDto)).rejects.toThrow(
        new ForbiddenException(
          `A tag with the name "${tagDto.name}" already exists.`,
        ),
      );

      expect(prismaService.tag.findUnique).toHaveBeenCalledWith({
        where: { name: tagDto.name },
      });
      expect(prismaService.tag.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update an existing tag', async () => {
      const tagId = 'tag1';
      const tagUpdateDto: TagUpdateDto = {
        name: 'Updated Tag',
      };

      prismaService.tag.update = jest.fn().mockResolvedValue({
        id: tagId,
        ...tagUpdateDto,
      });

      const result = await service.update(tagId, tagUpdateDto);

      expect(prismaService.tag.update).toHaveBeenCalledWith({
        where: { id: tagId },
        data: tagUpdateDto,
      });
      expect(result).toBeDefined();
      expect(result.name).toEqual(tagUpdateDto.name);
    });
  });

  describe('delete', () => {
    it('should delete a tag', async () => {
      const tagId = 'tag1';

      prismaService.tag.delete = jest.fn().mockResolvedValue({
        id: tagId,
        name: 'Tag to Delete',
      });

      const result = await service.delete(tagId);

      expect(prismaService.tag.delete).toHaveBeenCalledWith({
        where: { id: tagId },
      });
      expect(result).toBeDefined();
      expect(result.id).toEqual(tagId);
    });
  });
});
