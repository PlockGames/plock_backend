import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { Tag } from '@prisma/client';
import { TagCreateDto, TagUpdateDto } from './tag.dto';
import { ResponseRequest, responseRequest } from '../shared/utils/response';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  GetTagsResponse,
  CreateTagResponse,
  UpdateTagResponse,
  DeleteTagResponse,
} from '../shared/swagger/responses';

@ApiTags('Tags')
@Controller('tag')
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiResponse(GetTagsResponse)
  @ApiOperation({ summary: 'List all tags', description: 'List all tags' })
  public async list(): Promise<ResponseRequest<Partial<Tag>[]>> {
    const tags = await this.tagService.list();
    return responseRequest<Partial<Tag>[]>('success', 'List of tags', tags);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiResponse(CreateTagResponse)
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
  @ApiResponse(UpdateTagResponse)
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
  @ApiResponse(DeleteTagResponse)
  @ApiOperation({ summary: 'Delete tag', description: 'Delete a tag' })
  public async delete(
    @Param('id') id: string,
  ): Promise<ResponseRequest<Partial<Tag>>> {
    const tagDeleted = await this.tagService.delete(id);
    return responseRequest<Partial<Tag>>('success', 'Tag deleted', tagDeleted);
  }
}
