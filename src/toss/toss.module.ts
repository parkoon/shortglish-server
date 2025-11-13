import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TossController } from './toss.controller';
import { TossService } from './toss.service';
import { TossApiClient } from './toss-api.client';
import { BasicAuthGuard } from './guards/basic-auth.guard';
import { TossTokenGuard } from './guards/toss-token.guard';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [TossController],
  providers: [TossService, TossApiClient, BasicAuthGuard, TossTokenGuard],
  exports: [TossService],
})
export class TossModule {}

