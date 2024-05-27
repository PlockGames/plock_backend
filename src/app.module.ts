import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GamesController } from './games/games.controller';
import { R2Service } from './r2/r2.service';
import { R2Controller } from './r2/r2.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigModule globally available
    }),
  ],
  controllers: [AppController, GamesController, R2Controller],
  providers: [AppService, R2Service],
})
export class AppModule { }
