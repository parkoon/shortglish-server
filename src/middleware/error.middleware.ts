import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export interface ErrorResponse {
  resultType: 'FAIL';
  error: {
    errorCode: string;
    reason: string;
  };
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  logger.error(
    {
      error: err,
      url: req.url,
      method: req.method,
    },
    '에러 발생',
  );

  // TOSS API 에러 형식이면 그대로 사용
  if (err && typeof err === 'object' && 'resultType' in err) {
    const statusCode = err.statusCode || 400;
    res.status(statusCode).json(err);
    return;
  }

  // Express 에러
  if (err && typeof err === 'object' && 'status' in err) {
    const status = err.status || 500;
    const message = err.message || '요청을 처리하는 도중에 문제가 발생했습니다.';

    res.status(status).json({
      resultType: 'FAIL',
      error: {
        errorCode: err.errorCode || 'INTERNAL_ERROR',
        reason: message,
      },
    });
    return;
  }

  // 알 수 없는 에러
  res.status(500).json({
    resultType: 'FAIL',
    error: {
      errorCode: 'INTERNAL_ERROR',
      reason: '서버 오류가 발생했습니다.',
    },
  });
}

