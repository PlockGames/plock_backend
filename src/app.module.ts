import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GamesController } from './games/games.controller';
import { R2Service } from './r2/r2.service';

@Module({
  imports: [],
  controllers: [AppController, GamesController],
  providers: [AppService, R2Service],
})
export class AppModule {}
