import { GlobalExceptionFilter, TransformInterceptor } from '@hris/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
// import fs from 'fs';

async function bootstrap() {
  const logger = new Logger('NestApplication');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const reflector = app.get(Reflector);

  app.use(cookieParser());
  app.useGlobalInterceptors(new TransformInterceptor(reflector));
  app.useGlobalFilters(new GlobalExceptionFilter());

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidUnknownValues: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('HRIS - Auth Service')
    .setDescription('Auth Service API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // fs.writeFileSync('./swagger-spec.json', JSON.stringify(document, null, 2));

  SwaggerModule.setup('api/docs', app, document);

  const PORT = configService.get<number>('AUTH_SERVICE_PORT');
  await app.listen(PORT, '0.0.0.0');

  logger.log(`🚀 Application is running on: http://localhost:${PORT}/api/v1`);
  logger.log(`📚 Swagger docs available at: http://localhost:${PORT}/api/docs`);
}

void bootstrap();
