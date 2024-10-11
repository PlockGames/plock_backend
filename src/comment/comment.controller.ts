import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { Comment, User } from '@prisma/client';
import { CommentCreateDto, CommentDto, CommentUpdateDto } from './comment.dto';
import { ResponseRequest, responseRequest } from '../shared/utils/response';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

import { Request } from 'express';
import { CommentOwnerInterceptor } from '../shared/interceptors/comment-owner.interceptor';
import { PaginatedOutputDto } from '../shared/interfaces/pagination';
import { ApiPaginatedResponse } from '../shared/decorators/pagination.decorator';
import { ResponseOneSchema } from '../shared/decorators/response-one.decorator';
@ApiTags('Comments')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get('game/:idGame')
  @ApiBearerAuth('JWT-auth')
  @ApiPaginatedResponse(CommentDto)
  @ApiOperation({
    summary: 'Get all comments of a game',
    description: 'Retrieve all comments for a specific game',
  })
  public async getAllCommentsForGame(
    @Param('idGame') idGame: string,
    @Query('page') page: number = 1,
    @Query('perPage') perPage: number = 10,
  ) {
    const comments = await this.commentService.getAllCommentsForGame(
      idGame,
      page,
      perPage,
    );
    return responseRequest<PaginatedOutputDto<CommentDto>>(
      'success',
      'Comments retrieved',
      comments,
    );
  }

  @Post(':idGame')
  @ApiBearerAuth('JWT-auth')
  @ResponseOneSchema(CommentDto)
  @ApiBody({
    description: 'Comment details',
    type: CommentCreateDto,
  })
  @ApiOperation({
    summary: 'Create comment',
    description: 'Create a new comment on a game',
  })
  public async create(
    @Body() comment: CommentCreateDto,
    @Param('idGame') idGame: string,
    @Req() req: Request,
  ): Promise<ResponseRequest<Partial<Comment>>> {
    const commentCreated = await this.commentService.create(
      req.user as User,
      idGame,
      comment,
    );
    return responseRequest<Partial<Comment>>(
      'success',
      'Comment created on game',
      commentCreated,
    );
  }

  @Put(':id')
  @UseInterceptors(CommentOwnerInterceptor)
  @ApiBearerAuth('JWT-auth')
  @ResponseOneSchema(CommentDto)
  @ApiBody({
    description: 'Comment details',
    type: CommentUpdateDto,
  })
  @ApiOperation({
    summary: 'Update comment',
    description: 'Update an existing comment',
  })
  public async update(
    @Param('id') id: string,
    @Body() comment: CommentUpdateDto,
  ): Promise<ResponseRequest<Partial<Comment>>> {
    const commentUpdated = await this.commentService.update(id, comment);
    return responseRequest<Partial<Comment>>(
      'success',
      'Comment updated',
      commentUpdated,
    );
  }

  @Delete(':id')
  @UseInterceptors(CommentOwnerInterceptor)
  @ApiBearerAuth('JWT-auth')
  @ResponseOneSchema(CommentDto)
  @ApiOperation({ summary: 'Delete comment', description: 'Delete a comment' })
  public async delete(
    @Param('id') id: string,
  ): Promise<ResponseRequest<Partial<Comment>>> {
    const commentDeleted = await this.commentService.delete(id);
    return responseRequest<Partial<Comment>>(
      'success',
      'Comment deleted',
      commentDeleted,
    );
  }
}
