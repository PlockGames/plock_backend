import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { ConfigModule } from '@nestjs/config';
import { RecommendationModule } from '../recommendation/recommendation.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RecommendationModule,
  ],
  providers: [GameService],
  controllers: [GameController],
})
export class GameModule {}
