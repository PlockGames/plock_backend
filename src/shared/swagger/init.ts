import { Logger } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

export default class Swagger {
  config: Omit<OpenAPIObject, 'paths'>;
  running: boolean;

  constructor(private app) {
    this.setDocument();
  }

  setDocumentBuilder() {
    this.config = new DocumentBuilder()
      .setTitle('PLOCK API')
      .setDescription('API for managing the app PLOCK')
      .setVersion('1.0')
      .addTag('PLOCK')
      .addServer('/api')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();
  }

  setDocument() {
    this.setDocumentBuilder();
    const document = SwaggerModule.createDocument(this.app, this.config);
    SwaggerModule.setup('/api/docs', this.app, document);
    this.running = true;
  }

  status() {
    if (!this.running)
      Logger.log(`❌Swagger is not running, something went wrong`);
    else
      Logger.log(
        `✅ Swagger is running on: ${process.env.HOST}${process.env.PORT ? ':' + process.env.PORT : ''}/api/docs`,
      );
  }
}
