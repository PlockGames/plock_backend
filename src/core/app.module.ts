import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GamesController } from '../features/games/games.controller';
import { WinConditionsController } from '../shared/winconditions/winconditions.controller';
import { GameObjectsController } from '../features/gameobjects/gameobjects.controller';
import { UserModule } from '../features/user/user.module';
import { PrismaModule } from '../shared/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from '../features/comment/comment.module';
import { R2Module } from '../shared/r2/r2module';
import { R2Service } from '../shared/r2/r2.service';
import { WinConditionsModule } from '../shared/winconditions/winconditions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    PrismaModule,
    AuthModule,
    CommentModule,
    R2Module,
    WinConditionsModule
  ],
  controllers: [
    GamesController,
    GameObjectsController,
  ],
  providers: [R2Service],
})
export class AppModule {}
