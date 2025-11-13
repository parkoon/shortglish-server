import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Global prefix 설정
  app.setGlobalPrefix('api')

  // CORS 설정 (모든 origin 허용)
  app.enableCors({
    origin: true,
    credentials: true,
  })

  const port = process.env.PORT || 4000
  await app.listen(port)
  console.log(`🚀 Server is running on: http://localhost:${port}`)
}

bootstrap()
