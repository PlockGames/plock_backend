import { Module } from '@nestjs/common';
import { GameObjectsController } from './gameobjects.controller';
import { R2Module } from 'src/shared/r2/r2module';

@Module({
  imports: [R2Module],
  controllers: [GameObjectsController],
})
export class GameObjectsModule {}
