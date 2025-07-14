import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule); // ✅ must be first
  app.useGlobalPipes(new ValidationPipe());         // ✅ then add pipes
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
