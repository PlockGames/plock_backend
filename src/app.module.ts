import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GamesController } from './games/games.controller';
import { R2Service } from './services/r2/r2.service';
import { CommentsController } from './comments/comments.controller';
import { WinConditionsController } from './winconditions/winconditions.controller';
import { GameObjectsController } from './gameobjects/gameobjects.controller';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigModule globally available
    }),
    UserModule,
  ],
  controllers: [
    GamesController,
    CommentsController,
    WinConditionsController,
    GameObjectsController,
  ],
  providers: [R2Service],
})
export class AppModule {}
