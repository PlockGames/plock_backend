import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { Comment, User } from '@prisma/client';
import { CommentCreateDto, CommentUpdateDto } from './comment.dto';
import { ResponseRequest, responseRequest } from '../shared/utils/response';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateCommentResponse,
  UpdateCommentResponse,
  DeleteCommentResponse,
} from '../shared/swagger/responses';
import { Request } from 'express';

@ApiTags('Comments')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post(':idPost')
  @ApiBearerAuth('JWT-auth')
  @ApiResponse(CreateCommentResponse)
  @ApiBody({
    description: 'Comment details',
    type: CommentCreateDto,
  })
  @ApiOperation({
    summary: 'Create comment',
    description: 'Create a new comment',
  })
  public async create(
    @Body() comment: CommentCreateDto,
    @Param('idPost') idPost: string,
    @Req() req: Request,
  ): Promise<ResponseRequest<Partial<Comment>>> {
    const commentCreated = await this.commentService.create(
      req.user as User,
      idPost,
      comment,
    );
    return responseRequest<Partial<Comment>>(
      'success',
      'Comment created',
      commentCreated,
    );
  }

  @Put(':idPost')
  @ApiBearerAuth('JWT-auth')
  @ApiResponse(UpdateCommentResponse)
  @ApiBody({
    description: 'Comment details',
    type: CommentUpdateDto,
  })
  @ApiOperation({
    summary: 'Update comment',
    description: 'Update an existing comment',
  })
  public async update(
    @Param('idPost') id: string,
    @Body() comment: CommentUpdateDto,
    @Req() req: Request,
  ): Promise<ResponseRequest<Partial<Comment>>> {
    const commentUpdated = await this.commentService.update(
      req.user as User,
      id,
      comment,
    );
    return responseRequest<Partial<Comment>>(
      'success',
      'Comment updated',
      commentUpdated,
    );
  }

  @Delete(':idPost')
  @ApiBearerAuth('JWT-auth')
  @ApiResponse(DeleteCommentResponse)
  @ApiOperation({ summary: 'Delete comment', description: 'Delete a comment' })
  public async delete(
    @Param('idPost') id: string,
  ): Promise<ResponseRequest<Partial<Comment>>> {
    const commentDeleted = await this.commentService.delete(id);
    return responseRequest<Partial<Comment>>(
      'success',
      'Comment deleted',
      commentDeleted,
    );
  }
}
