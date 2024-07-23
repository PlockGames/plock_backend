import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { CommentService as CommentService } from './comment.service';

@Controller('comment')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get(':id')
  public async getCommentById(@Param('id') id: string) {
    return this.commentService.getCommentById(id);
  }

  @Get('game/:gameId')
  public async getCommentsByGameId(@Param('gameId') gameId: string) {
    return this.commentService.getCommentsByGameId(gameId);
  }

  @Post()
  public async createComment(@Body() commentData: any) {
    return this.commentService.createComment(commentData);
  }

  @Put(':id')
  async updateComment(@Param('id') id: string, @Body() commentData: any) {
    return this.commentService.updateComment(id, commentData);
  }

  @Delete(':id')
  async deleteComment(@Param('id') id: string) {
    return this.commentService.deleteComment(id);
  }
}
