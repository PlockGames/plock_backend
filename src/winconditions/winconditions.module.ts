import { Module } from '@nestjs/common';
import { WinConditionsController } from './winconditions.controller';
import { R2Module } from '../r2/r2module';

@Module({
  imports: [R2Module],
  controllers: [WinConditionsController],
})
export class WinConditionsModule {}
