import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { PrismaModule } from './shared/modules/prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { R2Module } from './shared/modules/r2/r2module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt.guards';
import { UserTypeGuard } from './auth/guards/user-type.guard';
import { FriendModule } from './friend/friend.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { GameModule } from './game/game.module';
import { TagModule } from './tag/tag.module';
import { ReviewModule } from './review/review.module';
import { MinioClientModule } from './shared/modules/minio-client/minio-client.module';

@Module({
  imports: [
    UserModule,
    PrismaModule,
    AuthModule,
    R2Module,
    FriendModule,
    PostModule,
    CommentModule,
    GameModule,
    TagModule,
    ReviewModule,
    MinioClientModule,
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
