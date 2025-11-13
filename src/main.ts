import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from './common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Pino Logger 사용
  const logger = app.get(Logger);
  app.useLogger(logger);

  // CORS 설정
  app.enableCors();

  // 글로벌 예외 필터 설정
  app.useGlobalFilters(new HttpExceptionFilter());

  // 글로벌 Validation 파이프 설정
  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`서버가 시작되었습니다: http://localhost:${port}`, 'Bootstrap');
}
bootstrap();
