import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { ConfigModule } from '@nestjs/config';
import { RecommendationModule } from '../recommendation/recommendation.module';
import { LikeModule } from '../like/like.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RecommendationModule,
    LikeModule,
  ],
  providers: [GameService],
  controllers: [GameController],
})
export class GameModule {}
