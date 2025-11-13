import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class TossTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException({
        resultType: 'FAIL',
        error: {
          errorCode: 'UNAUTHORIZED',
          reason: '인증 헤더가 필요합니다.',
        },
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException({
        resultType: 'FAIL',
        error: {
          errorCode: 'UNAUTHORIZED',
          reason: '인증 헤더 형식이 올바르지 않습니다. Bearer 토큰이 필요합니다.',
        },
      });
    }

    const token = authHeader.substring(7);
    if (!token) {
      throw new UnauthorizedException({
        resultType: 'FAIL',
        error: {
          errorCode: 'UNAUTHORIZED',
          reason: '액세스 토큰이 필요합니다.',
        },
      });
    }

    request.accessToken = token;
    return true;
  }
}

