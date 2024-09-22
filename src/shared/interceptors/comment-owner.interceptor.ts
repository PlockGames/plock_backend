import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  ForbiddenException,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '@prisma/client';
import { CommentService } from '../../comment/comment.service';

@Injectable()
export class CommentOwnerInterceptor implements NestInterceptor {
  constructor(private readonly commentService: CommentService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const user: User = req.user;

    const commentId = req.params.id;
    const comment = await this.commentService.get(commentId);

    if (comment.userId !== user.id) {
      throw new ForbiddenException('You are not the owner of this comment');
    }

    return next.handle().pipe(
      map((data) => {
        return data;
      }),
    );
  }
}
