import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorResponse: any = {
      resultType: 'FAIL',
      error: {
        errorCode: 'INTERNAL_ERROR',
        reason: '서버 오류가 발생했습니다.',
      },
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        // TOSS API 에러 형식이면 그대로 사용
        if ('resultType' in exceptionResponse) {
          errorResponse = exceptionResponse;
        } else if ('error' in exceptionResponse) {
          // NestJS 기본 에러 형식
          errorResponse = {
            resultType: 'FAIL',
            error: {
              errorCode: (exceptionResponse as any).error || 'UNKNOWN_ERROR',
              reason:
                (exceptionResponse as any).message ||
                '요청을 처리하는 도중에 문제가 발생했습니다.',
            },
          };
        } else {
          // 단순 메시지 형식
          errorResponse = {
            resultType: 'FAIL',
            error: {
              errorCode: 'BAD_REQUEST',
              reason:
                (exceptionResponse as any).message ||
                '요청을 처리하는 도중에 문제가 발생했습니다.',
            },
          };
        }
      }
    }

    response.status(status).json(errorResponse);
  }
}

