import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { Tag } from '@prisma/client';
import { TagCreateDto, TagDto, TagUpdateDto } from './tag.dto';
import { ResponseRequest, responseRequest } from '../shared/utils/response';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginatedOutputDto } from '../shared/interfaces/pagination';
import { ApiPaginatedResponse } from '../shared/decorators/pagination.decorator';
import { ResponseOneSchema } from '../shared/decorators/response-one.decorator';

@ApiTags('Tags')
@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiPaginatedResponse(TagDto)
  @ApiOperation({ summary: 'List all tags', description: 'List all tags' })
  public async list(
    @Query('page') page: number = 1,
    @Query('perPage') perPage: number = 10,
  ) {
    const tags = await this.tagService.list(page, perPage);
    return responseRequest<PaginatedOutputDto<TagDto>>(
      'success',
      'List of tags',
      tags,
    );
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ResponseOneSchema(TagDto)
  @ApiBody({
    description: 'Tag details',
    type: TagCreateDto,
  })
  @ApiOperation({ summary: 'Create tag', description: 'Create a new tag' })
  public async create(
    @Body() tag: TagCreateDto,
  ): Promise<ResponseRequest<Partial<Tag>>> {
    const tagCreated = await this.tagService.create(tag);
    return responseRequest<Partial<Tag>>('success', 'Tag created', tagCreated);
  }

  @Put(':id')
  @ApiBearerAuth('JWT-auth')
  @ResponseOneSchema(TagDto)
  @ApiBody({
    description: 'Tag details',
    type: TagUpdateDto,
  })
  @ApiOperation({
    summary: 'Update tag',
    description: 'Update an existing tag',
  })
  public async update(
    @Param('id') id: string,
    @Body() tag: TagUpdateDto,
  ): Promise<ResponseRequest<Partial<Tag>>> {
    const tagUpdated = await this.tagService.update(id, tag);
    return responseRequest<Partial<Tag>>('success', 'Tag updated', tagUpdated);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ResponseOneSchema(TagDto)
  @ApiOperation({ summary: 'Delete tag', description: 'Delete a tag' })
  public async delete(
    @Param('id') id: string,
  ): Promise<ResponseRequest<Partial<Tag>>> {
    const tagDeleted = await this.tagService.delete(id);
    return responseRequest<Partial<Tag>>('success', 'Tag deleted', tagDeleted);
  }
}
