import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { R2Module } from '../shared/modules/r2/r2module';

@Module({
  imports: [R2Module],
  providers: [GameService],
  controllers: [GameController],
})
export class GameModule {}
