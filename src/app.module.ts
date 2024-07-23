import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GamesController } from './games/games.controller';
import { R2Service } from './services/r2/r2.service';
import { WinConditionsController } from './winconditions/winconditions.controller';
import { GameObjectsController } from './gameobjects/gameobjects.controller';
import { UserModule } from './user/user.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    PrismaModule,
    AuthModule,
    CommentModule,
  ],
  controllers: [
    GamesController,
    WinConditionsController,
    GameObjectsController,
  ],
  providers: [R2Service],
})
export class AppModule {}
