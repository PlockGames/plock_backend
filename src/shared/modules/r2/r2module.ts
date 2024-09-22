import { Module } from '@nestjs/common';
import { R2Service } from './r2.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [R2Service],
  exports: [R2Service],
})
export class R2Module {}
