# Railway 배포 가이드

## 1. Railway 프로젝트 생성

1. [Railway](https://railway.app)에 로그인
2. "New Project" 클릭
3. "Deploy from GitHub repo" 선택
4. 저장소 선택

## 2. 프로젝트 설정

### Build & Start 명령어
Railway가 `package.json`의 스크립트를 자동으로 감지하지만, 명시적으로 설정하려면:
- Build Command: `yarn build`
- Start Command: `yarn start`

### Node.js 설정
- Node.js 버전: 18.x 이상 권장
- Package Manager: Yarn 1.22.22 (자동 감지됨)

## 3. 환경 변수 설정

Railway 대시보드의 "Variables" 탭에서 다음 환경 변수를 설정:

### 필수 환경 변수
```
NODE_ENV=production
TOSS_API_BASE_URL=https://apps-in-toss-api.toss.im
```

> **참고**: 현재 CORS는 모든 origin을 허용하도록 설정되어 있습니다 (`src/main.ts:12-15`).
> 프로덕션에서 특정 도메인만 허용하려면 `src/main.ts`의 CORS 설정을 수정해야 합니다.

### 클라이언트 인증서

Railway의 파일 시스템에 인증서 파일을 업로드하고 환경 변수로 경로를 지정:

```
TOSS_CLIENT_CERT_PATH=./certs/client-cert.pem
TOSS_CLIENT_KEY_PATH=./certs/client-key.pem
```

또는 Railway의 Secrets 기능을 사용하여 Base64로 인코딩된 인증서를 환경 변수로 저장할 수 있습니다.
이 경우 코드에서 Base64 디코딩 로직을 추가해야 합니다.

### 복호화 키
```
TOSS_DECRYPT_KEY=<base64_encoded_decrypt_key>
TOSS_AAD=TOSS
```

## 4. 배포 확인

1. Railway 대시보드에서 배포 상태 확인
2. 로그 확인: "Deployments" → "View Logs"
3. Health check 테스트:
   - `https://your-railway-url.railway.app/api/health`
   - `https://your-railway-url.railway.app/api` (Hello World)

## 5. 프론트엔드 환경 변수 설정

프론트엔드 `.env` 파일에 백엔드 URL 추가:
```
VITE_APP_API_BASE_URL=https://your-railway-url.railway.app
```

> **참고**: API 엔드포인트는 `/api` prefix가 자동으로 추가됩니다 (`src/main.ts:9`).

## 트러블슈팅

### 클라이언트 인증서 오류
- 인증서 파일 경로가 올바른지 확인
- 환경 변수 이름 확인: `TOSS_CLIENT_CERT_PATH`, `TOSS_CLIENT_KEY_PATH`
- Railway에 인증서 파일이 제대로 업로드되었는지 확인

### Port 관련 오류
- Railway는 자동으로 `PORT` 환경 변수를 설정합니다
- `src/main.ts`에서 `process.env.PORT || 4000`로 포트를 읽습니다

### 빌드 실패
- `package.json`의 빌드 스크립트 확인
- TypeScript 컴파일 오류 확인 (`yarn build`로 로컬 테스트)
- `tsconfig.json` 설정 확인 (ESM 모듈 사용)

