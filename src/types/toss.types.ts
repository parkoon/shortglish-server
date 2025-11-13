export interface TokenResponse {
  resultType: 'SUCCESS' | 'FAIL';
  success?: {
    tokenType: string;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    scope: string;
  };
  error?: {
    errorCode?: string;
    reason?: string;
    error?: string;
  };
}

export interface UserInfo {
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

export interface UserInfoResponse {
  resultType: 'SUCCESS' | 'FAIL';
  success?: UserInfo;
  error?: {
    errorCode?: string;
    reason?: string;
    error?: string;
  };
}

