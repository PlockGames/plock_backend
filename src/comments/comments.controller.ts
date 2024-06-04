import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Controller('comments')
export class CommentsController {
  constructor() {} // Inject Prisma service

  /**
   * Get a comment by its ID.
   * @param {string} id - The ID of the comment to retrieve.
   * @returns {Promise<object>} The comment object.
   */
  @Get(':id')
  async getCommentById(@Param('id') id: string) {
    try {
      const comment = await prisma.comment.findUnique({
        where: { id: parseInt(id) },
      });
      if (!comment) {
        throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
      }
      return comment;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Get comments by game ID.
   * @param {string} gameId - The ID of the game to retrieve comments for.
   * @returns {Promise<object[]>} A list of comments for the specified game.
   */
  @Get('byGame/:gameId')
  async getCommentsByGameId(@Param('gameId') gameId: string) {
    try {
      const comments = await prisma.comment.findMany({
        where: { gameId: parseInt(gameId) },
      });
      if (comments.length === 0) {
        throw new HttpException(
          'No comments found for this game',
          HttpStatus.NOT_FOUND,
        );
      }
      return comments;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Create a new comment.
   * @param {object} commentData - The data for the new comment.
   * @returns {Promise<object>} The created comment object.
   */
  @Post()
  async createComment(@Body() commentData: any) {
    try {
      const newComment = await prisma.comment.create({ data: commentData });
      return newComment;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Update an existing comment by its ID.
   * @param {string} id - The ID of the comment to update.
   * @param {object} commentData - The new data for the comment.
   * @returns {Promise<object>} The updated comment object.
   */
  @Put(':id')
  async updateComment(@Param('id') id: string, @Body() commentData: any) {
    try {
      const updatedComment = await prisma.comment.update({
        where: { id: parseInt(id) },
        data: commentData,
      });
      return updatedComment;
    } catch (error) {
      if (error.code === 'P2025') {
        // Prisma error code for record not found
        throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Delete a comment by its ID.
   * @param {string} id - The ID of the comment to delete.
   * @returns {Promise<object>} The deleted comment object.
   */
  @Delete(':id')
  async deleteComment(@Param('id') id: string) {
    try {
      const deletedComment = await prisma.comment.delete({
        where: { id: parseInt(id) },
      });
      return deletedComment;
    } catch (error) {
      if (error.code === 'P2025') {
        // Prisma error code for record not found
        throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
