import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../feature/user/user.module';
import { PrismaModule } from '../shared/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from '../feature/comment/comment.module';
import { R2Module } from '../shared/r2/r2module';
import { WinConditionsModule } from '../shared/winconditions/winconditions.module';
import { GameObjectsModule } from '../shared/gameobjects/gameobjects.module';
import { GamesModule } from '../feature/games/games.module';

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
    WinConditionsModule,
    GameObjectsModule,
    GamesModule,
  ],
})
export class AppModule {}
