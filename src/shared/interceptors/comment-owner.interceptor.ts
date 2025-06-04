import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  ForbiddenException,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '@prisma/client';
import { CommentService } from '../../comment/comment.service';

@Injectable()
export class CommentOwnerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CommentOwnerInterceptor.name);

  constructor(private readonly commentService: CommentService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const user: User = req.user;
    const commentId = req.params.id;

    this.logger.log(
      `Checking ownership for comment ID: ${commentId} by user ID: ${user.id}`,
    );

    const comment = await this.commentService.get(commentId);

    if (!comment) {
      this.logger.warn(`Comment not found: ID ${commentId}`);
      throw new ForbiddenException('Comment not found');
    }

    if (comment.userId !== user.id) {
      this.logger.warn(
        `User ID: ${user.id} is not the owner of comment ID: ${commentId}`,
      );
      throw new ForbiddenException('You are not the owner of this comment');
    }

    this.logger.log(
      `User ID: ${user.id} is the owner of comment ID: ${commentId}`,
    );

    return next.handle().pipe(
      map((data) => {
        return data;
      }),
    );
  }
}
