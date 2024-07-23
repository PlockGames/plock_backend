import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Injectable()
export class CommentService {
  constructor(private prismaService: PrismaService) {}

  /**
   * Get a comment by its ID.
   * @param {string} id - The ID of the comment to retrieve.
   * @returns {Promise<object>} The comment object.
   */
  public async getCommentById(id: string) {
    try {
      const comment = await this.prismaService.comment.findUnique({
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
  public async getCommentsByGameId(gameId: string) {
    try {
      const comments = await this.prismaService.comment.findMany({
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
  public async createComment(commentData: any) {
    try {
      const newComment = await this.prismaService.comment.create({
        data: commentData,
      });
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
  public async updateComment(id: string, commentData: any) {
    try {
      const updatedComment = await this.prismaService.comment.update({
        where: { id: parseInt(id) },
        data: commentData,
      });
      return updatedComment;
    } catch (error) {
      if (error.code === 'P2025') {
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
  public async deleteComment(id: string) {
    try {
      const deletedComment = await this.prismaService.comment.delete({
        where: { id: parseInt(id) },
      });
      return deletedComment;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
