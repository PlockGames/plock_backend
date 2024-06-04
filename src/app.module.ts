import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GamesController } from './games/games.controller';
import { R2Service } from './services/r2/r2.service';
import { CommentsController } from './comments/comments.controller';
import { WinConditionsController } from './winconditions/winconditions.controller';
import { GameObjectsController } from './gameobjects/gameobjects.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigModule globally available
    }),
  ],
  controllers: [AppController, GamesController, CommentsController, WinConditionsController, GameObjectsController],
  providers: [AppService, R2Service],
})
export class AppModule { }
