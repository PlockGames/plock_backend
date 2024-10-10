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
import { GameService } from '../../game/game.service';

@Injectable()
export class GameOwnerInterceptor implements NestInterceptor {
  constructor(private readonly gameService: GameService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const user: User = req.user;

    const gameId = req.params.id;
    const game = await this.gameService.getGame(gameId);

    if (!game || game.creatorId !== user.id) {
      throw new ForbiddenException('You are not the creator of this game');
    }

    return next.handle().pipe(
      map((data) => {
        return data;
      }),
    );
  }
}
