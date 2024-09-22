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
import { PostService } from '../../post/post.service';

@Injectable()
export class PostOwnerInterceptor implements NestInterceptor {
  constructor(private readonly postService: PostService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const user: User = req.user;

    const postId = req.params.id;
    const post = await this.postService.get(postId);

    if (!post || post.userId !== user.id) {
      throw new ForbiddenException('You are not the owner of this post');
    }

    return next.handle().pipe(
      map((data) => {
        return data;
      }),
    );
  }
}
