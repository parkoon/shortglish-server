import { TossApiService } from './toss-api.service';
import { decrypt } from '../utils/decrypt.util';
import { logger } from '../utils/logger';
import type {
  TokenResponse,
  UserInfoResponse,
  UserInfo,
} from '../types/toss.types';

export class TossService {
  private tossApiService: TossApiService;

  constructor() {
    this.tossApiService = new TossApiService();
  }

  async generateToken(
    authorizationCode: string,
    referrer: string,
  ): Promise<TokenResponse> {
    const response = await this.tossApiService.generateToken(
      authorizationCode,
      referrer,
    );

    if (response.resultType === 'FAIL') {
      throw response;
    }

    return response;
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await this.tossApiService.refreshToken(refreshToken);

    if (response.resultType === 'FAIL') {
      throw response;
    }

    return response;
  }

  async getUserInfo(accessToken: string): Promise<UserInfoResponse> {
    const response = await this.tossApiService.getUserInfo(accessToken);

    if (response.resultType === 'FAIL') {
      throw response;
    }

    return response;
  }

  async decryptUserInfo(userInfo: UserInfoResponse): Promise<UserInfoResponse> {
    if (userInfo.resultType === 'FAIL' || !userInfo.success) {
      return userInfo;
    }

    const decryptedInfo: UserInfo = { ...userInfo.success };

    const fieldsToDecrypt: (keyof UserInfo)[] = [
      'name',
      'phone',
      'birthday',
      'ci',
      'gender',
      'nationality',
    ];

    for (const field of fieldsToDecrypt) {
      if (decryptedInfo[field]) {
        try {
          (decryptedInfo as any)[field] = decrypt(decryptedInfo[field] as string);
        } catch (error) {
          logger.error(
            {
              field,
              error: error instanceof Error ? error.message : String(error),
            },
            '필드 복호화에 실패했습니다',
          );
        }
      }
    }

    return {
      ...userInfo,
      success: decryptedInfo,
    };
  }

  async logout(accessToken: string): Promise<void> {
    await this.tossApiService.logoutByAccessToken(accessToken);
  }

  async logoutByUserKey(
    accessToken: string,
    userKey: number,
  ): Promise<{ resultType: string; success: { userKey: number } }> {
    return this.tossApiService.logoutByUserKey(accessToken, userKey);
  }
}

