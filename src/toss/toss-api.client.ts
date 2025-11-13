import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
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
    private readonly logger: Logger,
  ) {}

  private get baseUrl(): string {
    return this.configService.tossApiBaseUrl;
  }

  async generateToken(
    authorizationCode: string,
    referrer: string,
  ): Promise<TokenResponse> {
    const url = `${this.baseUrl}/api-partner/v1/apps-in-toss/user/oauth2/generate-token`;
    
    this.logger.debug(
      { url, referrer },
      'TOSS API: AccessToken 발급 요청',
    );

    try {
      const response = await firstValueFrom(
        this.httpService.post<TokenResponse>(
          url,
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

      this.logger.debug(
        { url, resultType: response.data.resultType },
        'TOSS API: AccessToken 발급 성공',
      );

      return response.data;
    } catch (error: any) {
      this.logger.error(
        {
          url,
          statusCode: error.response?.status,
          error: error.response?.data || error.message,
        },
        'TOSS API: AccessToken 발급 실패',
      );

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
    const url = `${this.baseUrl}/api-partner/v1/apps-in-toss/user/oauth2/refresh-token`;
    
    this.logger.debug({ url }, 'TOSS API: AccessToken 재발급 요청');

    try {
      const response = await firstValueFrom(
        this.httpService.post<TokenResponse>(
          url,
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

      this.logger.debug(
        { url, resultType: response.data.resultType },
        'TOSS API: AccessToken 재발급 성공',
      );

      return response.data;
    } catch (error: any) {
      this.logger.error(
        {
          url,
          statusCode: error.response?.status,
          error: error.response?.data || error.message,
        },
        'TOSS API: AccessToken 재발급 실패',
      );

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
    const url = `${this.baseUrl}/api-partner/v1/apps-in-toss/user/oauth2/login-me`;
    
    this.logger.debug({ url }, 'TOSS API: 사용자 정보 조회 요청');

    try {
      const response = await firstValueFrom(
        this.httpService.get<UserInfoResponse>(
          url,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      this.logger.debug(
        { url, userKey: response.data.success?.userKey },
        'TOSS API: 사용자 정보 조회 성공',
      );

      return response.data;
    } catch (error: any) {
      this.logger.error(
        {
          url,
          statusCode: error.response?.status,
          error: error.response?.data || error.message,
        },
        'TOSS API: 사용자 정보 조회 실패',
      );

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
    const url = `${this.baseUrl}/api-partner/v1/apps-in-toss/user/oauth2/access/remove-by-access-token`;
    
    this.logger.debug({ url }, 'TOSS API: 로그아웃 요청 (AccessToken)');

    try {
      await firstValueFrom(
        this.httpService.post(
          url,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      this.logger.debug({ url }, 'TOSS API: 로그아웃 성공');
    } catch (error: any) {
      this.logger.error(
        {
          url,
          statusCode: error.response?.status,
          error: error.response?.data || error.message,
        },
        'TOSS API: 로그아웃 실패',
      );

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
    const url = `${this.baseUrl}/api-partner/v1/apps-in-toss/user/oauth2/access/remove-by-user-key`;
    
    this.logger.debug({ url, userKey }, 'TOSS API: 로그아웃 요청 (userKey)');

    try {
      const response = await firstValueFrom(
        this.httpService.post<{ resultType: string; success: { userKey: number } }>(
          url,
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

      this.logger.debug({ url, userKey }, 'TOSS API: 로그아웃 성공');

      return response.data;
    } catch (error: any) {
      this.logger.error(
        {
          url,
          userKey,
          statusCode: error.response?.status,
          error: error.response?.data || error.message,
        },
        'TOSS API: 로그아웃 실패',
      );

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

