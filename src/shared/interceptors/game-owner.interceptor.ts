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
import { GameService } from '../../game/game.service';

@Injectable()
export class GameOwnerInterceptor implements NestInterceptor {
  private readonly logger = new Logger(GameOwnerInterceptor.name);

  constructor(private readonly gameService: GameService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const user: User = req.user;
    const gameId = req.params.id;

    this.logger.log(
      `Checking ownership for game ID: ${gameId} by user ID: ${user.id}`,
    );

    const game = await this.gameService.getGame(gameId);

    if (!game) {
      this.logger.warn(`Game not found: ID ${gameId}`);
      throw new ForbiddenException('Game not found');
    }

    if (game.creatorId !== user.id) {
      this.logger.warn(
        `User ID: ${user.id} is not the creator of game ID: ${gameId}`,
      );
      throw new ForbiddenException('You are not the creator of this game');
    }

    this.logger.log(`User ID: ${user.id} is the creator of game ID: ${gameId}`);

    return next.handle().pipe(
      map((data) => {
        return data;
      }),
    );
  }
}
