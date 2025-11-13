# TOSS 로그인 모듈 설정 가이드

TOSS 로그인 모듈 구현이 완료되었습니다. 아래 설정을 진행해주세요.

## 1. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 환경 변수를 설정해주세요:

```env
# Server
PORT=4000
NODE_ENV=development

# TOSS API Configuration
TOSS_API_BASE_URL=https://apps-in-toss-api.toss.im
TOSS_DECRYPT_KEY=your-base64-encoded-aes-key-here
TOSS_DECRYPT_AAD=TOSS

# TOSS Callback Basic Auth (Optional)
# TOSS_CALLBACK_BASIC_AUTH_USERNAME=your-username
# TOSS_CALLBACK_BASIC_AUTH_PASSWORD=your-password
```

### 필수 환경 변수 설명

- **TOSS_DECRYPT_KEY**: TOSS 콘솔에서 이메일로 받은 복호화 키 (Base64 인코딩된 AES-256 키)
- **TOSS_DECRYPT_AAD**: 복호화에 사용되는 AAD (Additional Authenticated Data), 기본값은 "TOSS"
- **TOSS_CALLBACK_BASIC_AUTH_USERNAME/PASSWORD**: 콜백 엔드포인트에 Basic Auth를 설정하려는 경우 사용 (선택사항)

## 2. TOSS 콘솔에서 복호화 키 받기

1. TOSS 개발자 콘솔에 로그인
2. 앱 설정에서 복호화 키 확인
3. 복호화 키를 Base64 형식으로 `.env` 파일의 `TOSS_DECRYPT_KEY`에 설정

## 3. API 엔드포인트

구현된 엔드포인트 목록:

### POST /toss/token
- AccessToken 발급
- 요청: `{ authorizationCode: string, referrer: string }`
- 응답: `{ resultType: "SUCCESS", success: { accessToken, refreshToken, expiresIn, scope, tokenType } }`

### POST /toss/refresh
- AccessToken 재발급
- 요청: `{ refreshToken: string }`
- 응답: 동일한 토큰 형식

### GET /toss/me
- 사용자 정보 조회
- 헤더: `Authorization: Bearer {accessToken}`
- 응답: 암호화된 사용자 정보

### POST /toss/decrypt
- 사용자 정보 복호화
- 요청: `{ encryptedData: string }`
- 응답: `{ resultType: "SUCCESS", success: { decryptedData: string } }`

### POST /toss/decrypt-user-info
- 전체 사용자 정보 복호화
- 요청: `/toss/me` 엔드포인트의 응답 전체
- 응답: 모든 필드가 복호화된 사용자 정보

### POST /toss/logout
- 로그인 연결 끊기 (AccessToken 기반)
- 헤더: `Authorization: Bearer {accessToken}`

### POST /toss/logout-by-user-key
- 로그인 연결 끊기 (userKey 기반)
- 헤더: `Authorization: Bearer {accessToken}`
- 요청: `{ userKey: number }`

### GET /toss/callback
- 콜백 처리 (GET 방식)
- Query: `?userKey={number}&referrer={string}`
- **Basic Auth**: 환경 변수 설정 시 `Authorization: Basic {base64(username:password)}` 헤더 필요

### POST /toss/callback
- 콜백 처리 (POST 방식)
- 요청: `{ userKey: number, referrer: string }`
- **Basic Auth**: 환경 변수 설정 시 `Authorization: Basic {base64(username:password)}` 헤더 필요

## 4. 콜백 Basic Auth 설정 (선택사항)

TOSS 콘솔에서 콜백 URL에 Basic Auth를 설정한 경우, 환경 변수에 인증 정보를 설정하면 자동으로 적용됩니다.

### 구현 완료
- ✅ `src/toss/guards/basic-auth.guard.ts`: Basic Auth Guard 구현 완료
- ✅ `src/toss/toss.controller.ts`: 콜백 엔드포인트에 Guard 적용 완료

### 사용 방법
1. `.env` 파일에 Basic Auth 정보 추가:
   ```env
   TOSS_CALLBACK_BASIC_AUTH_USERNAME=your-username
   TOSS_CALLBACK_BASIC_AUTH_PASSWORD=your-password
   ```

2. 환경 변수가 설정되지 않은 경우, Guard는 자동으로 통과됩니다 (선택사항이므로)

3. 환경 변수가 설정된 경우, TOSS에서 콜백을 호출할 때 다음 헤더를 포함해야 합니다:
   ```
   Authorization: Basic base64(username:password)
   ```

## 5. 테스트

서버를 실행하고 테스트해보세요:

```bash
# 개발 모드 실행
yarn start:dev

# 프로덕션 빌드
yarn build
yarn start:prod
```

## 6. 주의사항

- **Stateless 설계**: 서버는 토큰을 저장하지 않습니다. 클라이언트가 토큰을 관리하고 서버는 프록시 역할만 수행합니다.
- **에러 응답 형식**: 모든 에러는 `{ resultType: "FAIL", error: { errorCode, reason } }` 형식으로 반환됩니다.
- **복호화 키 보안**: `.env` 파일은 절대 Git에 커밋하지 마세요. `.gitignore`에 이미 포함되어 있습니다.

## 7. 향후 개선 사항

- [x] 콜백 Basic Auth Guard 구현
- [x] 로깅 시스템 추가 (Pino)
- [ ] Rate Limiting 추가
- [ ] Swagger/OpenAPI 문서화
- [ ] 단위 테스트 및 E2E 테스트 작성

## 8. 로깅 시스템 (Pino)

Pino 로깅 시스템이 적용되었습니다.

### 로그 레벨
- **개발 환경**: `debug` 레벨 (모든 로그 출력)
- **프로덕션 환경**: `info` 레벨 (중요한 로그만 출력)

### 로그 포맷
- **개발 환경**: `pino-pretty`를 사용한 읽기 쉬운 포맷
- **프로덕션 환경**: JSON 포맷 (구조화된 로그)

### 자동 로깅
- 모든 HTTP 요청/응답이 자동으로 로깅됩니다
- `/health` 엔드포인트는 로깅에서 제외됩니다

### 주요 로깅 위치
- **TOSS API 호출**: 요청/성공/실패 모두 로깅
- **복호화 실패**: 필드별 복호화 실패 시 로깅
- **서버 시작**: 서버 시작 시 포트 정보 로깅

### 로그 사용 예시
```typescript
// Service나 Controller에서
constructor(private readonly logger: Logger) {}

this.logger.debug({ data }, '디버그 메시지');
this.logger.info({ data }, '정보 메시지');
this.logger.warn({ data }, '경고 메시지');
this.logger.error({ error }, '에러 메시지');
```

