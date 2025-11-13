import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TossApiClient } from './toss-api.client';
import { DecryptUtil } from './utils/decrypt.util';
import { ConfigService } from '../config/config.service';
import { GenerateTokenDto } from './dto/generate-token.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { DecryptDto } from './dto/decrypt.dto';
import { LogoutByUserKeyDto } from './dto/logout.dto';
import { TokenResponse } from './interfaces/token-response.interface';
import { UserInfoResponse } from './interfaces/user-info.interface';

@Injectable()
export class TossService {
  constructor(
    private readonly tossApiClient: TossApiClient,
    private readonly configService: ConfigService,
  ) {}

  async generateToken(dto: GenerateTokenDto): Promise<TokenResponse> {
    const response = await this.tossApiClient.generateToken(
      dto.authorizationCode,
      dto.referrer,
    );

    if (response.resultType === 'FAIL') {
      throw new UnauthorizedException(response.error);
    }

    return response;
  }

  async refreshToken(dto: RefreshTokenDto): Promise<TokenResponse> {
    const response = await this.tossApiClient.refreshToken(dto.refreshToken);

    if (response.resultType === 'FAIL') {
      throw new UnauthorizedException(response.error);
    }

    return response;
  }

  async getUserInfo(accessToken: string): Promise<UserInfoResponse> {
    const response = await this.tossApiClient.getUserInfo(accessToken);

    if (response.resultType === 'FAIL') {
      throw new UnauthorizedException(response.error);
    }

    return response;
  }

  async decrypt(dto: DecryptDto): Promise<string> {
    return DecryptUtil.decrypt(dto.encryptedData, this.configService);
  }

  async decryptUserInfo(userInfo: UserInfoResponse): Promise<any> {
    if (userInfo.resultType === 'FAIL' || !userInfo.success) {
      return userInfo;
    }

    const decryptedInfo = { ...userInfo.success };

    const fieldsToDecrypt = [
      'name',
      'phone',
      'birthday',
      'ci',
      'gender',
      'nationality',
    ] as const;

    for (const field of fieldsToDecrypt) {
      if (decryptedInfo[field]) {
        try {
          decryptedInfo[field] = DecryptUtil.decrypt(
            decryptedInfo[field] as string,
            this.configService,
          );
        } catch (error) {
          // 복호화 실패 시 원본 유지
          console.error(`Failed to decrypt field ${field}:`, error);
        }
      }
    }

    return {
      ...userInfo,
      success: decryptedInfo,
    };
  }

  async logout(accessToken: string): Promise<void> {
    await this.tossApiClient.logoutByAccessToken(accessToken);
  }

  async logoutByUserKey(
    accessToken: string,
    dto: LogoutByUserKeyDto,
  ): Promise<{ resultType: string; success: { userKey: number } }> {
    return this.tossApiClient.logoutByUserKey(accessToken, dto.userKey);
  }
}

