import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private nestConfigService: NestConfigService) {}

  get tossApiBaseUrl(): string {
    return (
      this.nestConfigService.get<string>('TOSS_API_BASE_URL') ||
      'https://apps-in-toss-api.toss.im'
    );
  }

  get tossDecryptKey(): string {
    const key = this.nestConfigService.get<string>('TOSS_DECRYPT_KEY');
    if (!key) {
      throw new Error('TOSS_DECRYPT_KEY 환경 변수가 필요합니다.');
    }
    return key;
  }

  get tossDecryptAad(): string {
    const aad = this.nestConfigService.get<string>('TOSS_DECRYPT_AAD');
    if (!aad) {
      throw new Error('TOSS_DECRYPT_AAD 환경 변수가 필요합니다.');
    }
    return aad;
  }

  get tossCallbackBasicAuthUsername(): string | undefined {
    return this.nestConfigService.get<string>('TOSS_CALLBACK_BASIC_AUTH_USERNAME');
  }

  get tossCallbackBasicAuthPassword(): string | undefined {
    return this.nestConfigService.get<string>('TOSS_CALLBACK_BASIC_AUTH_PASSWORD');
  }
}

