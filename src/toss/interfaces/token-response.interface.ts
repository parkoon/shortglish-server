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

