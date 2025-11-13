import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from './common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정
  app.enableCors();

  // 글로벌 예외 필터 설정
  app.useGlobalFilters(new HttpExceptionFilter());

  // 글로벌 Validation 파이프 설정
  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
