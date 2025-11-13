import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    const username = this.configService.tossCallbackBasicAuthUsername;
    const password = this.configService.tossCallbackBasicAuthPassword;

    // 환경 변수가 설정되지 않았으면 Guard를 통과 (선택사항)
    if (!username || !password) {
      return true;
    }

    if (!authHeader) {
      throw new UnauthorizedException({
        resultType: 'FAIL',
        error: {
          errorCode: 'UNAUTHORIZED',
          reason: '인증 헤더가 필요합니다.',
        },
      });
    }

    if (!authHeader.startsWith('Basic ')) {
      throw new UnauthorizedException({
        resultType: 'FAIL',
        error: {
          errorCode: 'UNAUTHORIZED',
          reason: '인증 헤더 형식이 올바르지 않습니다. Basic 인증이 필요합니다.',
        },
      });
    }

    const base64Credentials = authHeader.substring(6);
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
    const [providedUsername, providedPassword] = credentials.split(':');

    if (!providedUsername || !providedPassword) {
      throw new UnauthorizedException({
        resultType: 'FAIL',
        error: {
          errorCode: 'UNAUTHORIZED',
          reason: 'Basic 인증 자격 증명 형식이 올바르지 않습니다.',
        },
      });
    }

    if (providedUsername !== username || providedPassword !== password) {
      throw new UnauthorizedException({
        resultType: 'FAIL',
        error: {
          errorCode: 'UNAUTHORIZED',
          reason: 'Basic 인증 자격 증명이 올바르지 않습니다.',
        },
      });
    }

    return true;
  }
}

