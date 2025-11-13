# 서버 별도 레포지토리로 이동 가이드

이 폴더(`server/`)를 별도의 Git 레포지토리로 분리하는 방법입니다.

## 이동 전 준비사항

1. 현재 `server/` 폴더의 모든 파일이 독립적으로 작동하는지 확인
2. 필요한 환경 변수 목록 확인 (`.env.example` 참고)

## 이동 방법

### 1. 새 레포지토리 생성

```bash
# 새 디렉토리 생성
mkdir shortglish-server
cd shortglish-server

# Git 초기화
git init
```

### 2. 서버 폴더 내용 복사

```bash
# 현재 프로젝트에서
cp -r server/* /path/to/shortglish-server/
cd /path/to/shortglish-server
```

또는 Git submodule로 관리하려면:

```bash
# 새 레포 생성 후
git submodule add <새-레포-URL> server
```

### 3. 필요한 파일 확인

다음 파일들이 포함되어 있는지 확인하세요:

- `package.json` - 의존성 및 스크립트
- `tsconfig.json` - TypeScript 설정
- `src/` - 소스 코드
- `.env.example` - 환경 변수 예시
- `README.md` - 서버 문서
- `DEPLOYMENT.md` - 배포 가이드
- `nixpacks.toml` - Railway 배포 설정
- `railway.json` - Railway 설정
- `.gitignore` - Git 무시 파일
- `.eslintrc.json` - ESLint 설정 (선택)
- `.prettierrc.json` - Prettier 설정 (선택)

### 4. 환경 변수 설정

`.env.example`을 복사하여 `.env` 파일 생성:

```bash
cp .env.example .env
# .env 파일을 편집하여 실제 값 입력
```

### 5. 의존성 설치 및 테스트

```bash
yarn install
yarn dev  # 개발 서버 실행 테스트
yarn build  # 빌드 테스트
yarn start  # 프로덕션 모드 테스트
```

### 6. Railway 배포 설정 업데이트

새 레포지토리로 이동한 후:

1. Railway에서 새 프로젝트 생성
2. GitHub 레포지토리 연결
3. Root Directory를 `.` (루트)로 설정
4. 환경 변수 설정 (`.env.example` 참고)
5. 클라이언트 인증서 설정 (Base64 또는 파일 업로드)

## 주의사항

- 클라이언트 인증서 파일(`certs/`)은 Git에 커밋하지 마세요
- `.env` 파일도 Git에 커밋하지 마세요
- Railway 배포 시 환경 변수는 Railway 대시보드에서 설정하세요

## 클라이언트 연동

클라이언트에서 서버 API를 호출할 때:

```env
VITE_APP_API_BASE_URL=https://your-railway-url.railway.app
```

환경 변수를 설정하면 됩니다.

