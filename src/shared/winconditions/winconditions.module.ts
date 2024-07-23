import { Module } from '@nestjs/common';
import { WinConditionsController } from './winconditions.controller';
import { R2Module } from 'src/shared/r2/r2module';
import { R2Service } from 'src/shared/r2/r2.service';

@Module({
  imports: [R2Module],
  controllers: [WinConditionsController],
  providers: [R2Service],
})
export class WinConditionsModule {}
