import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { TossModule } from './toss/toss.module';

@Module({
  imports: [ConfigModule, TossModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
