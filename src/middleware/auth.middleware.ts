import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  accessToken?: string;
}

export function tossTokenAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      resultType: 'FAIL',
      error: {
        errorCode: 'UNAUTHORIZED',
        reason: '인증 헤더가 필요합니다.',
      },
    });
    return;
  }

  if (!authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      resultType: 'FAIL',
      error: {
        errorCode: 'UNAUTHORIZED',
        reason: '인증 헤더 형식이 올바르지 않습니다. Bearer 토큰이 필요합니다.',
      },
    });
    return;
  }

  const token = authHeader.substring(7);
  if (!token) {
    res.status(401).json({
      resultType: 'FAIL',
      error: {
        errorCode: 'UNAUTHORIZED',
        reason: '액세스 토큰이 필요합니다.',
      },
    });
    return;
  }

  req.accessToken = token;
  next();
}

export function basicAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // 동적 import로 순환 참조 방지
  const config = require('../config/config').config;
  const username = config.toss.callbackBasicAuth?.username;
  const password = config.toss.callbackBasicAuth?.password;

  // 환경 변수가 설정되지 않았으면 통과 (선택사항)
  if (!username || !password) {
    next();
    return;
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      resultType: 'FAIL',
      error: {
        errorCode: 'UNAUTHORIZED',
        reason: '인증 헤더가 필요합니다.',
      },
    });
    return;
  }

  if (!authHeader.startsWith('Basic ')) {
    res.status(401).json({
      resultType: 'FAIL',
      error: {
        errorCode: 'UNAUTHORIZED',
        reason: '인증 헤더 형식이 올바르지 않습니다. Basic 인증이 필요합니다.',
      },
    });
    return;
  }

  const base64Credentials = authHeader.substring(6);
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf8');
  const [providedUsername, providedPassword] = credentials.split(':');

  if (!providedUsername || !providedPassword) {
    res.status(401).json({
      resultType: 'FAIL',
      error: {
        errorCode: 'UNAUTHORIZED',
        reason: 'Basic 인증 자격 증명 형식이 올바르지 않습니다.',
      },
    });
    return;
  }

  if (providedUsername !== username || providedPassword !== password) {
    res.status(401).json({
      resultType: 'FAIL',
      error: {
        errorCode: 'UNAUTHORIZED',
        reason: 'Basic 인증 자격 증명이 올바르지 않습니다.',
      },
    });
    return;
  }

  next();
}

