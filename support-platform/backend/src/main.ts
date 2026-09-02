import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('SupportPlatformBootstrap');
  const app = await NestFactory.create(AppModule);

  // Enable CORS for Support Frontend (:5174)
  app.enableCors({
    origin: ['http://localhost:5174', 'http://127.0.0.1:5174', 'http://localhost:5173'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global prefix & validation pipe
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`🚀 QSR Developer & Support Platform API running on: http://localhost:${port}/api`);
}
bootstrap();
