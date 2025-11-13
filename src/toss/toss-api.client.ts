import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '../config/config.service';
import { TokenResponse } from './interfaces/token-response.interface';
import { UserInfoResponse } from './interfaces/user-info.interface';

@Injectable()
export class TossApiClient {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private get baseUrl(): string {
    return this.configService.tossApiBaseUrl;
  }

  async generateToken(
    authorizationCode: string,
    referrer: string,
  ): Promise<TokenResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<TokenResponse>(
          `${this.baseUrl}/api-partner/v1/apps-in-toss/user/oauth2/generate-token`,
          {
            authorizationCode,
            referrer,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new HttpException(
          error.response.data,
          error.response.status || HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          resultType: 'FAIL',
          error: {
            errorCode: 'INTERNAL_ERROR',
            reason: 'TOSS API 호출 중 오류가 발생했습니다.',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<TokenResponse>(
          `${this.baseUrl}/api-partner/v1/apps-in-toss/user/oauth2/refresh-token`,
          {
            refreshToken,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new HttpException(
          error.response.data,
          error.response.status || HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          resultType: 'FAIL',
          error: {
            errorCode: 'INTERNAL_ERROR',
            reason: 'TOSS API 호출 중 오류가 발생했습니다.',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserInfo(accessToken: string): Promise<UserInfoResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<UserInfoResponse>(
          `${this.baseUrl}/api-partner/v1/apps-in-toss/user/oauth2/login-me`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new HttpException(
          error.response.data,
          error.response.status || HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          resultType: 'FAIL',
          error: {
            errorCode: 'INTERNAL_ERROR',
            reason: 'TOSS API 호출 중 오류가 발생했습니다.',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async logoutByAccessToken(accessToken: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/api-partner/v1/apps-in-toss/user/oauth2/access/remove-by-access-token`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );
    } catch (error: any) {
      if (error.response?.data) {
        throw new HttpException(
          error.response.data,
          error.response.status || HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          resultType: 'FAIL',
          error: {
            errorCode: 'INTERNAL_ERROR',
            reason: 'TOSS API 호출 중 오류가 발생했습니다.',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async logoutByUserKey(
    accessToken: string,
    userKey: number,
  ): Promise<{ resultType: string; success: { userKey: number } }> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<{ resultType: string; success: { userKey: number } }>(
          `${this.baseUrl}/api-partner/v1/apps-in-toss/user/oauth2/access/remove-by-user-key`,
          {
            userKey,
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw new HttpException(
          error.response.data,
          error.response.status || HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          resultType: 'FAIL',
          error: {
            errorCode: 'INTERNAL_ERROR',
            reason: 'TOSS API 호출 중 오류가 발생했습니다.',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

