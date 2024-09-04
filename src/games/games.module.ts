import { Module } from '@nestjs/common';
import { GamesController } from './games.controller';
import { R2Module } from 'src/r2/r2module';

@Module({
  imports: [R2Module],
  controllers: [GamesController],
})
export class GamesModule {}
