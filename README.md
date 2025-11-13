# Shortglish Backend Server

NestJS 기반 토스 로그인 API 프록시 서버

## 기술 스택

- **Framework**: NestJS 11.x
- **Runtime**: Node.js with TypeScript 5.8
- **Module System**: ESM (ECMAScript Modules)
- **Package Manager**: Yarn 1.22.22

## 개발 환경 설정

### 1. 의존성 설치
```bash
yarn install
```

### 2. 환경 변수 설정
`.env` 파일을 생성하고 `.env.example`을 참고하여 변수들을 설정하세요:

```bash
cp .env.example .env
```

필수 환경 변수:
- `PORT`: 서버 포트 (기본값: 4000)
- `TOSS_API_BASE_URL`: 토스 API 베이스 URL
- `TOSS_CLIENT_CERT_PATH`: 클라이언트 인증서 경로
- `TOSS_CLIENT_KEY_PATH`: 클라이언트 개인키 경로
- `TOSS_DECRYPT_KEY`: 토스 복호화 키 (Base64)
- `TOSS_AAD`: 토스 AAD (기본값: TOSS)

### 3. 클라이언트 인증서 준비
`certs/` 디렉토리에 다음 파일들을 배치하세요:
- `client-cert.pem` - 클라이언트 인증서
- `client-key.pem` - 클라이언트 개인 키

### 4. 개발 서버 실행
```bash
yarn dev          # tsx watch로 핫 리로드 지원
```

서버 실행 확인: http://localhost:4000/api

## 프로덕션 빌드

```bash
yarn build        # TypeScript 컴파일 → dist/
yarn start        # 프로덕션 서버 실행
```

## 코드 품질

```bash
yarn lint         # ESLint 실행
yarn format       # Prettier로 코드 포맷팅
```

## Railway 배포

자세한 배포 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참고하세요.

간단 요약:
1. Railway에 GitHub 저장소 연결
2. 환경 변수 설정 (NODE_ENV, TOSS_* 관련 변수들)
3. 클라이언트 인증서 업로드
4. 자동 배포 완료

## API 엔드포인트

> **참고**: 모든 엔드포인트는 `/api` prefix가 자동으로 추가됩니다.

### Health Check
- `GET /api` - Hello World
- `GET /api/health` - Health check

### Toss API (계획)
- `POST /api/toss/generate-token` - AccessToken 발급
- `POST /api/toss/refresh-token` - AccessToken 재발급
- `GET /api/toss/login-me` - 사용자 정보 조회
- `POST /api/toss/unlink/access-token` - AccessToken으로 연결 끊기
- `POST /api/toss/unlink/user-key` - userKey로 연결 끊기

