# Express 마이그레이션 완료

NestJS에서 Express로 성공적으로 마이그레이션되었습니다.

## 변경 사항

### 구조 변경

**이전 (NestJS):**
```
src/
├── app.module.ts
├── app.controller.ts
├── toss/
│   ├── toss.module.ts
│   ├── toss.controller.ts
│   └── toss.service.ts
└── config/
    ├── config.module.ts
    └── config.service.ts
```

**현재 (Express):**
```
src/
├── index.ts              # 앱 진입점
├── app.ts                # Express 앱 설정
├── config/
│   └── config.ts        # 환경 변수 설정
├── routes/
│   ├── index.ts         # 라우터 통합
│   └── toss.routes.ts   # TOSS 라우터
├── services/
│   ├── toss.service.ts  # 비즈니스 로직
│   └── toss-api.service.ts  # TOSS API 클라이언트
├── middleware/
│   ├── auth.middleware.ts      # 인증 미들웨어
│   ├── error.middleware.ts     # 에러 핸들러
│   └── validation.middleware.ts # 검증 미들웨어
├── utils/
│   ├── logger.ts        # Pino 로거
│   └── decrypt.util.ts  # 복호화 유틸리티
└── types/
    └── toss.types.ts    # TypeScript 타입 정의
```

### 주요 변경점

1. **의존성 주입 제거**: NestJS의 DI 대신 직접 인스턴스 생성
2. **모듈 시스템 제거**: Express 라우터로 대체
3. **Guard → Middleware**: Express 미들웨어로 변환
4. **Filter → Error Handler**: Express 에러 핸들러로 변환
5. **Pipe → express-validator**: express-validator로 검증

### 패키지 변경

**추가된 패키지:**
- `express`: Express 프레임워크
- `express-validator`: 요청 검증
- `cors`: CORS 처리
- `dotenv`: 환경 변수 관리
- `pino-http`: HTTP 요청 로깅
- `ts-node-dev`: 개발 서버

**제거된 패키지:**
- NestJS 관련 패키지들은 아직 package.json에 남아있지만 사용하지 않음
- 필요시 `yarn remove`로 제거 가능

### 스크립트 변경

**이전:**
```json
{
  "build": "nest build",
  "start": "nest start",
  "start:dev": "nest start --watch",
  "start:prod": "node dist/main"
}
```

**현재:**
```json
{
  "build": "tsc",
  "start": "node dist/index.js",
  "start:dev": "ts-node-dev --respawn --transpile-only src/index.ts",
  "start:prod": "node dist/index.js"
}
```

## Express Best Practices 적용

### 1. 라우터 분리
- 각 기능별로 라우터 파일 분리
- `routes/index.ts`에서 통합 관리

### 2. 미들웨어 분리
- 인증, 에러 처리, 검증을 각각 미들웨어로 분리
- 재사용 가능한 구조

### 3. 서비스 레이어
- 비즈니스 로직을 서비스 클래스로 분리
- 컨트롤러는 HTTP 요청/응답만 처리

### 4. 타입 안정성
- TypeScript 타입 정의 파일 분리
- Express Request 타입 확장 (`AuthRequest`)

### 5. 에러 처리
- 중앙화된 에러 핸들러
- 일관된 에러 응답 형식

### 6. 로깅
- Pino 로거 통합
- HTTP 요청 자동 로깅

## 실행 방법

### 개발 모드
```bash
yarn start:dev
```

### 프로덕션 빌드
```bash
yarn build
yarn start:prod
```

### 타입 체크
```bash
yarn type-check
```

## API 엔드포인트

모든 API 엔드포인트는 기존과 동일하게 유지됩니다:

- `POST /toss/token` - AccessToken 발급
- `POST /toss/refresh` - AccessToken 재발급
- `GET /toss/me` - 사용자 정보 조회
- `POST /toss/decrypt` - 단일 필드 복호화
- `POST /toss/decrypt-user-info` - 전체 사용자 정보 복호화
- `POST /toss/logout` - 로그아웃
- `POST /toss/logout-by-user-key` - userKey로 로그아웃
- `GET /toss/callback` - 콜백 (GET)
- `POST /toss/callback` - 콜백 (POST)
- `GET /health` - 헬스 체크

## 복구 방법

NestJS 버전으로 되돌리려면:

```bash
git checkout backup/nestjs-version
```

## 다음 단계

1. **테스트 작성**: Express 기반 테스트 작성
2. **NestJS 패키지 제거**: 사용하지 않는 NestJS 패키지 제거
3. **문서 업데이트**: README 및 가이드 문서 업데이트

