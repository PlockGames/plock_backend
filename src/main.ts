import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import Swagger from './shared/swagger/init';
import {json} from "express";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.useGlobalPipes(new ValidationPipe());
  app.use(json({ limit: '1000mb' }));
  app.enableCors();
  const swagger = new Swagger(app);
  app.setGlobalPrefix(globalPrefix);
  await app.listen(process.env.PORT);
  swagger.status();
  Logger.log(
    `🚀 Application is running on: ${process.env.HOST}${process.env.PORT ? ':' + process.env.PORT : ''}/${globalPrefix}`,
  );
}
bootstrap();
