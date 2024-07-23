import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from './comment/comment.module';
import { R2Module } from './r2/r2module';
import { WinConditionsModule } from './to-see-how-implement/winconditions/winconditions.module';
import { GameObjectsModule } from './to-see-how-implement/gameobjects/gameobjects.module';
import { GamesModule } from './games/games.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt.guards';
import { UserTypeGuard } from './auth/guards/user-type.guard';

@Module({
  imports: [
    UserModule,
    PrismaModule,
    AuthModule,
    CommentModule,
    R2Module,
    WinConditionsModule,
    GameObjectsModule,
    GamesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: UserTypeGuard,
    },
  ],
})
export class AppModule {}
