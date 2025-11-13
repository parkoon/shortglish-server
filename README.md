# Shortglish Server

NestJS 기반 Shortglish 서버 애플리케이션입니다.

## 설치

```bash
yarn install
```

## 실행

```bash
# 개발 모드
yarn start:dev

# 프로덕션 모드
yarn start:prod

# 디버그 모드
yarn start:debug
```

## 테스트

```bash
# 유닛 테스트
yarn test

# e2e 테스트
yarn test:e2e

# 테스트 커버리지
yarn test:cov
```

## 빌드

```bash
yarn build
```

## 환경 변수

`.env.example` 파일을 참고하여 `.env` 파일을 생성하세요.

## API 엔드포인트

- `GET /` - Hello World 메시지
- `GET /health` - 헬스체크

## 기술 스택

- NestJS
- TypeScript
- Jest (테스팅)
