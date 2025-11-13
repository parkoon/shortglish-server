# TOSS 로그인 React 클라이언트 연동 가이드

이 가이드는 React 클라이언트에서 TOSS 로그인 API를 연동하는 방법을 설명합니다.

## 목차

1. [개요](#개요)
2. [전제 조건](#전제-조건)
3. [로그인 플로우](#로그인-플로우)
4. [API 엔드포인트](#api-엔드포인트)
5. [React 구현 예제](#react-구현-예제)
6. [에러 처리](#에러-처리)
7. [토큰 관리](#토큰-관리)
8. [전체 예제 코드](#전체-예제-코드)

---

## 개요

TOSS 로그인은 다음과 같은 플로우로 진행됩니다:

1. **클라이언트**: TOSS SDK를 사용하여 인가 코드 받기
2. **클라이언트 → 서버**: 인가 코드를 서버로 전송하여 AccessToken 발급
3. **클라이언트**: AccessToken을 저장하고 관리
4. **클라이언트 → 서버**: AccessToken으로 사용자 정보 조회
5. **클라이언트 → 서버**: 필요시 사용자 정보 복호화

---

## 전제 조건

### 1. TOSS SDK 설치

React 프로젝트에 TOSS SDK를 설치합니다.

```bash
npm install @toss/sdk
# 또는
yarn add @toss/sdk
```

### 2. 서버 URL 설정

서버의 Base URL을 환경 변수로 설정합니다.

```env
# .env
REACT_APP_API_BASE_URL=http://localhost:4000
# 또는 프로덕션
REACT_APP_API_BASE_URL=https://your-server.com
```

---

## 로그인 플로우

```
┌─────────┐         ┌─────────┐         ┌─────────┐
│ Client  │         │ Server  │         │  TOSS   │
└────┬────┘         └────┬────┘         └────┬────┘
     │                   │                    │
     │ 1. appLogin()     │                    │
     │──────────────────>│                    │
     │                   │                    │
     │ 2. authorizationCode, referrer       │
     │<──────────────────│                    │
     │                   │                    │
     │ 3. POST /toss/token                    │
     │    {authorizationCode, referrer}       │
     │──────────────────>│                    │
     │                   │ 4. TOSS API 호출    │
     │                   │───────────────────>│
     │                   │ 5. AccessToken      │
     │                   │<───────────────────│
     │ 6. {accessToken, refreshToken}         │
     │<──────────────────│                    │
     │                   │                    │
     │ 7. GET /toss/me                        │
     │    Authorization: Bearer {token}       │
     │──────────────────>│                    │
     │                   │ 8. TOSS API 호출    │
     │                   │───────────────────>│
     │                   │ 9. 사용자 정보      │
     │                   │<───────────────────│
     │ 10. {userInfo}                         │
     │<──────────────────│                    │
```

---

## API 엔드포인트

### Base URL

```
개발: http://localhost:4000
프로덕션: https://your-server.com
```

### 1. AccessToken 발급

**POST** `/toss/token`

인가 코드를 사용하여 AccessToken을 발급받습니다.

**요청:**
```typescript
{
  authorizationCode: string;  // TOSS SDK에서 받은 인가 코드
  referrer: string;          // 'sandbox' 또는 'DEFAULT'
}
```

**응답:**
```typescript
{
  resultType: "SUCCESS",
  success: {
    tokenType: "Bearer",
    accessToken: string,
    refreshToken: string,
    expiresIn: number,        // 초 단위 (예: 3599)
    scope: string
  }
}
```

### 2. AccessToken 재발급

**POST** `/toss/refresh`

RefreshToken을 사용하여 새로운 AccessToken을 발급받습니다.

**요청:**
```typescript
{
  refreshToken: string;
}
```

**응답:**
```typescript
{
  resultType: "SUCCESS",
  success: {
    tokenType: "Bearer",
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    scope: string
  }
}
```

### 3. 사용자 정보 조회

**GET** `/toss/me`

AccessToken을 사용하여 사용자 정보를 조회합니다.

**헤더:**
```
Authorization: Bearer {accessToken}
```

**응답:**
```typescript
{
  resultType: "SUCCESS",
  success: {
    userKey: number,
    scope: string,
    agreedTerms: string[],
    name?: string,           // 암호화된 값
    phone?: string,          // 암호화된 값
    birthday?: string,       // 암호화된 값
    ci?: string,            // 암호화된 값
    di: null,
    gender?: string,         // 암호화된 값
    nationality?: string,   // 암호화된 값
    email?: string | null   // 암호화된 값
  }
}
```

### 4. 사용자 정보 복호화

**POST** `/toss/decrypt-user-info`

암호화된 사용자 정보를 복호화합니다.

**요청:**
```typescript
{
  // /toss/me 응답 전체를 그대로 전송
  resultType: "SUCCESS",
  success: { ... }
}
```

**응답:**
```typescript
{
  resultType: "SUCCESS",
  success: {
    userKey: number,
    scope: string,
    agreedTerms: string[],
    name?: string,           // 복호화된 값
    phone?: string,          // 복호화된 값
    birthday?: string,       // 복호화된 값
    ci?: string,            // 복호화된 값
    di: null,
    gender?: string,         // 복호화된 값
    nationality?: string,    // 복호화된 값
    email?: string | null    // 복호화된 값
  }
}
```

### 5. 로그아웃

**POST** `/toss/logout`

AccessToken을 사용하여 로그아웃합니다.

**헤더:**
```
Authorization: Bearer {accessToken}
```

**응답:**
```typescript
{
  resultType: "SUCCESS",
  success: {
    message: "로그아웃되었습니다."
  }
}
```

---

## React 구현 예제

### 1. API 클라이언트 설정

```typescript
// src/api/tossApi.ts
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

class TossApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.reason || '요청에 실패했습니다.');
    }

    return response.json();
  }

  async generateToken(authorizationCode: string, referrer: string) {
    return this.request<{
      resultType: string;
      success?: {
        tokenType: string;
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        scope: string;
      };
      error?: {
        errorCode: string;
        reason: string;
      };
    }>('/toss/token', {
      method: 'POST',
      body: JSON.stringify({ authorizationCode, referrer }),
    });
  }

  async refreshToken(refreshToken: string) {
    return this.request<{
      resultType: string;
      success?: {
        tokenType: string;
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        scope: string;
      };
      error?: {
        errorCode: string;
        reason: string;
      };
    }>('/toss/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async getUserInfo(accessToken: string) {
    return this.request<{
      resultType: string;
      success?: {
        userKey: number;
        scope: string;
        agreedTerms: string[];
        name?: string;
        phone?: string;
        birthday?: string;
        ci?: string;
        di: null;
        gender?: string;
        nationality?: string;
        email?: string | null;
      };
      error?: {
        errorCode: string;
        reason: string;
      };
    }>('/toss/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }

  async decryptUserInfo(userInfo: any) {
    return this.request<{
      resultType: string;
      success?: any;
      error?: {
        errorCode: string;
        reason: string;
      };
    }>('/toss/decrypt-user-info', {
      method: 'POST',
      body: JSON.stringify(userInfo),
    });
  }

  async logout(accessToken: string) {
    return this.request<{
      resultType: string;
      success?: {
        message: string;
      };
      error?: {
        errorCode: string;
        reason: string;
      };
    }>('/toss/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }
}

export const tossApi = new TossApiClient();
```

### 2. 토큰 관리 Hook

```typescript
// src/hooks/useTossAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { tossApi } from '../api/tossApi';

interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: number; // 만료 시각 (타임스탬프)
}

const TOKEN_STORAGE_KEY = 'toss_tokens';

export const useTossAuth = () => {
  const [tokens, setTokens] = useState<TokenData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 로컬 스토리지에서 토큰 로드
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (stored) {
      try {
        const tokenData = JSON.parse(stored);
        // 만료 시간 확인
        if (tokenData.expiresAt > Date.now()) {
          setTokens(tokenData);
        } else {
          // 만료된 토큰 삭제
          localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      } catch (e) {
        console.error('토큰 파싱 실패:', e);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    }
  }, []);

  // 토큰 저장
  const saveTokens = useCallback((data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }) => {
    const tokenData: TokenData = {
      ...data,
      expiresAt: Date.now() + data.expiresIn * 1000,
    };
    setTokens(tokenData);
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenData));
  }, []);

  // 로그인
  const login = useCallback(async (authorizationCode: string, referrer: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await tossApi.generateToken(authorizationCode, referrer);
      
      if (response.resultType === 'SUCCESS' && response.success) {
        saveTokens(response.success);
        return response.success;
      } else {
        throw new Error(response.error?.reason || '토큰 발급에 실패했습니다.');
      }
    } catch (err: any) {
      const errorMessage = err.message || '로그인에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [saveTokens]);

  // 토큰 갱신
  const refresh = useCallback(async () => {
    if (!tokens?.refreshToken) {
      throw new Error('리프레시 토큰이 없습니다.');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await tossApi.refreshToken(tokens.refreshToken);
      
      if (response.resultType === 'SUCCESS' && response.success) {
        saveTokens(response.success);
        return response.success;
      } else {
        throw new Error(response.error?.reason || '토큰 갱신에 실패했습니다.');
      }
    } catch (err: any) {
      const errorMessage = err.message || '토큰 갱신에 실패했습니다.';
      setError(errorMessage);
      // 갱신 실패 시 로그아웃 처리
      logout();
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [tokens?.refreshToken, saveTokens]);

  // 로그아웃
  const logout = useCallback(async () => {
    if (tokens?.accessToken) {
      try {
        await tossApi.logout(tokens.accessToken);
      } catch (err) {
        console.error('로그아웃 API 호출 실패:', err);
      }
    }

    setTokens(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setError(null);
  }, [tokens?.accessToken]);

  // 토큰 만료 확인 및 자동 갱신
  const ensureValidToken = useCallback(async (): Promise<string> => {
    if (!tokens) {
      throw new Error('로그인이 필요합니다.');
    }

    // 만료 5분 전이면 자동 갱신
    const fiveMinutes = 5 * 60 * 1000;
    if (tokens.expiresAt - Date.now() < fiveMinutes) {
      const newTokens = await refresh();
      return newTokens.accessToken;
    }

    return tokens.accessToken;
  }, [tokens, refresh]);

  return {
    tokens,
    isLoading,
    error,
    login,
    refresh,
    logout,
    ensureValidToken,
    isAuthenticated: !!tokens,
  };
};
```

### 3. 사용자 정보 Hook

```typescript
// src/hooks/useTossUser.ts
import { useState, useEffect, useCallback } from 'react';
import { tossApi } from '../api/tossApi';
import { useTossAuth } from './useTossAuth';

interface UserInfo {
  userKey: number;
  scope: string;
  agreedTerms: string[];
  name?: string;
  phone?: string;
  birthday?: string;
  ci?: string;
  di: null;
  gender?: string;
  nationality?: string;
  email?: string | null;
}

export const useTossUser = () => {
  const { ensureValidToken, isAuthenticated } = useTossAuth();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [decryptedUserInfo, setDecryptedUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 사용자 정보 조회
  const fetchUserInfo = useCallback(async () => {
    if (!isAuthenticated) {
      setError('로그인이 필요합니다.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const accessToken = await ensureValidToken();
      const response = await tossApi.getUserInfo(accessToken);

      if (response.resultType === 'SUCCESS' && response.success) {
        setUserInfo(response.success);
        return response.success;
      } else {
        throw new Error(response.error?.reason || '사용자 정보 조회에 실패했습니다.');
      }
    } catch (err: any) {
      const errorMessage = err.message || '사용자 정보 조회에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, ensureValidToken]);

  // 사용자 정보 복호화
  const decryptUserInfo = useCallback(async () => {
    if (!userInfo) {
      setError('사용자 정보를 먼저 조회해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await tossApi.decryptUserInfo({
        resultType: 'SUCCESS',
        success: userInfo,
      });

      if (response.resultType === 'SUCCESS' && response.success) {
        setDecryptedUserInfo(response.success);
        return response.success;
      } else {
        throw new Error(response.error?.reason || '복호화에 실패했습니다.');
      }
    } catch (err: any) {
      const errorMessage = err.message || '복호화에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userInfo]);

  return {
    userInfo,
    decryptedUserInfo,
    isLoading,
    error,
    fetchUserInfo,
    decryptUserInfo,
  };
};
```

### 4. 로그인 컴포넌트

```typescript
// src/components/TossLoginButton.tsx
import { useState } from 'react';
import { useTossAuth } from '../hooks/useTossAuth';

// TOSS SDK 타입 정의 (실제 SDK에 맞게 수정 필요)
declare global {
  interface Window {
    TossSDK?: {
      appLogin: () => Promise<{
        authorizationCode: string;
        referrer: string;
      }>;
    };
  }
}

export const TossLoginButton = () => {
  const { login, isLoading, error } = useTossAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (!window.TossSDK) {
      alert('TOSS SDK가 로드되지 않았습니다.');
      return;
    }

    setIsLoggingIn(true);

    try {
      // 1. TOSS SDK로 인가 코드 받기
      const { authorizationCode, referrer } = await window.TossSDK.appLogin();

      // 2. 서버로 인가 코드 전송하여 토큰 발급
      await login(authorizationCode, referrer);

      alert('로그인 성공!');
    } catch (err: any) {
      alert(`로그인 실패: ${err.message}`);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleLogin}
        disabled={isLoading || isLoggingIn}
      >
        {isLoading || isLoggingIn ? '로그인 중...' : 'TOSS로 로그인'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};
```

### 5. 사용자 정보 컴포넌트

```typescript
// src/components/UserInfo.tsx
import { useEffect } from 'react';
import { useTossUser } from '../hooks/useTossUser';
import { useTossAuth } from '../hooks/useTossAuth';

export const UserInfo = () => {
  const { isAuthenticated, logout } = useTossAuth();
  const {
    userInfo,
    decryptedUserInfo,
    isLoading,
    error,
    fetchUserInfo,
    decryptUserInfo,
  } = useTossUser();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserInfo();
    }
  }, [isAuthenticated, fetchUserInfo]);

  if (!isAuthenticated) {
    return <p>로그인이 필요합니다.</p>;
  }

  if (isLoading && !userInfo) {
    return <p>로딩 중...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>에러: {error}</p>;
  }

  return (
    <div>
      <h2>사용자 정보</h2>
      
      {userInfo && (
        <div>
          <p>User Key: {userInfo.userKey}</p>
          <p>Scope: {userInfo.scope}</p>
          <p>Agreed Terms: {userInfo.agreedTerms.join(', ')}</p>
          
          {decryptedUserInfo ? (
            <div>
              <h3>복호화된 정보</h3>
              <p>이름: {decryptedUserInfo.name || 'N/A'}</p>
              <p>전화번호: {decryptedUserInfo.phone || 'N/A'}</p>
              <p>생년월일: {decryptedUserInfo.birthday || 'N/A'}</p>
              <p>성별: {decryptedUserInfo.gender || 'N/A'}</p>
              <p>국적: {decryptedUserInfo.nationality || 'N/A'}</p>
              <p>이메일: {decryptedUserInfo.email || 'N/A'}</p>
            </div>
          ) : (
            <button onClick={decryptUserInfo} disabled={isLoading}>
              {isLoading ? '복호화 중...' : '정보 복호화'}
            </button>
          )}
        </div>
      )}

      <button onClick={logout}>로그아웃</button>
    </div>
  );
};
```

---

## 에러 처리

### 에러 응답 형식

모든 API는 다음 형식의 에러를 반환합니다:

```typescript
{
  resultType: "FAIL",
  error: {
    errorCode: string;
    reason: string;
  }
}
```

### 주요 에러 코드

- `UNAUTHORIZED`: 인증 실패 (토큰 만료, 잘못된 토큰 등)
- `VALIDATION_ERROR`: 입력값 검증 실패
- `INTERNAL_ERROR`: 서버 내부 오류
- `BAD_REQUEST`: 잘못된 요청

### 에러 처리 예제

```typescript
try {
  const response = await tossApi.getUserInfo(accessToken);
  
  if (response.resultType === 'FAIL') {
    if (response.error?.errorCode === 'UNAUTHORIZED') {
      // 토큰 만료 또는 무효한 토큰
      await refreshToken();
      // 재시도
    } else {
      // 다른 에러 처리
      console.error('에러:', response.error?.reason);
    }
  }
} catch (error) {
  console.error('네트워크 에러:', error);
}
```

---

## 토큰 관리

### 토큰 저장

- **로컬 스토리지**: `localStorage`에 토큰 저장
- **만료 시간**: `expiresIn` 값을 사용하여 만료 시각 계산
- **자동 갱신**: 만료 5분 전에 자동으로 RefreshToken으로 갱신

### 토큰 보안

- AccessToken은 클라이언트에 저장되지만, 민감한 정보는 포함하지 않음
- RefreshToken은 14일간 유효
- 로그아웃 시 서버에 토큰 무효화 요청

### 토큰 갱신 전략

```typescript
// 만료 5분 전 자동 갱신
const fiveMinutes = 5 * 60 * 1000;
if (tokens.expiresAt - Date.now() < fiveMinutes) {
  await refreshToken();
}
```

---

## 전체 예제 코드

### App.tsx

```typescript
import { TossLoginButton } from './components/TossLoginButton';
import { UserInfo } from './components/UserInfo';
import { useTossAuth } from './hooks/useTossAuth';

function App() {
  const { isAuthenticated } = useTossAuth();

  return (
    <div className="App">
      <h1>TOSS 로그인 예제</h1>
      
      {!isAuthenticated ? (
        <TossLoginButton />
      ) : (
        <UserInfo />
      )}
    </div>
  );
}

export default App;
```

---

## 주의사항

1. **TOSS SDK**: 실제 TOSS SDK 사용법은 TOSS 개발자 문서를 참고하세요.
2. **환경 변수**: 프로덕션에서는 반드시 환경 변수를 설정하세요.
3. **에러 처리**: 모든 API 호출에 에러 처리를 추가하세요.
4. **토큰 보안**: 프로덕션에서는 토큰을 안전하게 관리하세요 (HttpOnly 쿠키 등 고려).
5. **CORS**: 서버에서 CORS 설정이 올바르게 되어 있는지 확인하세요.

---

## 참고 자료

- [TOSS 로그인 스펙 문서](./docs/TOSS_LOGIN_SPEC.md)
- [서버 설정 가이드](./TOSS_SETUP.md)
- [TOSS 개발자 문서](https://developers.toss.im/)

