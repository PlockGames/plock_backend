import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GamesController } from '../features/games/games.controller';
import { WinConditionsController } from '../features/winconditions/winconditions.controller';
import { GameObjectsController } from '../features/gameobjects/gameobjects.controller';
import { UserModule } from '../features/user/user.module';
import { PrismaModule } from '../shared/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from '../features/comment/comment.module';
import { R2Module } from '../shared/r2/r2module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    PrismaModule,
    AuthModule,
    CommentModule,
    R2Module
  ],
  controllers: [
    GamesController,
    WinConditionsController,
    GameObjectsController,
  ],
})
export class AppModule {}
