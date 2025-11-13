import axios, { AxiosInstance } from 'axios';
import { config } from '../config/config';
import { logger } from '../utils/logger';
import type { TokenResponse, UserInfoResponse } from '../types/toss.types';

export class TossApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.toss.apiBaseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async generateToken(
    authorizationCode: string,
    referrer: string,
  ): Promise<TokenResponse> {
    const url = '/api-partner/v1/apps-in-toss/user/oauth2/generate-token';

    logger.debug({ url, referrer }, 'TOSS API: AccessToken 발급 요청');

    try {
      const response = await this.client.post<TokenResponse>(url, {
        authorizationCode,
        referrer,
      });

      logger.debug(
        { url, resultType: response.data.resultType },
        'TOSS API: AccessToken 발급 성공',
      );

      return response.data;
    } catch (error: any) {
      logger.error(
        {
          url,
          statusCode: error.response?.status,
          error: error.response?.data || error.message,
        },
        'TOSS API: AccessToken 발급 실패',
      );

      if (error.response?.data) {
        throw error.response.data;
      }

      throw {
        resultType: 'FAIL',
        error: {
          errorCode: 'INTERNAL_ERROR',
          reason: 'TOSS API 호출 중 오류가 발생했습니다.',
        },
      };
    }
  }

  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const url = '/api-partner/v1/apps-in-toss/user/oauth2/refresh-token';

    logger.debug({ url }, 'TOSS API: AccessToken 재발급 요청');

    try {
      const response = await this.client.post<TokenResponse>(url, {
        refreshToken,
      });

      logger.debug(
        { url, resultType: response.data.resultType },
        'TOSS API: AccessToken 재발급 성공',
      );

      return response.data;
    } catch (error: any) {
      logger.error(
        {
          url,
          statusCode: error.response?.status,
          error: error.response?.data || error.message,
        },
        'TOSS API: AccessToken 재발급 실패',
      );

      if (error.response?.data) {
        throw error.response.data;
      }

      throw {
        resultType: 'FAIL',
        error: {
          errorCode: 'INTERNAL_ERROR',
          reason: 'TOSS API 호출 중 오류가 발생했습니다.',
        },
      };
    }
  }

  async getUserInfo(accessToken: string): Promise<UserInfoResponse> {
    const url = '/api-partner/v1/apps-in-toss/user/oauth2/login-me';

    logger.debug({ url }, 'TOSS API: 사용자 정보 조회 요청');

    try {
      const response = await this.client.get<UserInfoResponse>(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      logger.debug(
        { url, userKey: response.data.success?.userKey },
        'TOSS API: 사용자 정보 조회 성공',
      );

      return response.data;
    } catch (error: any) {
      logger.error(
        {
          url,
          statusCode: error.response?.status,
          error: error.response?.data || error.message,
        },
        'TOSS API: 사용자 정보 조회 실패',
      );

      if (error.response?.data) {
        throw error.response.data;
      }

      throw {
        resultType: 'FAIL',
        error: {
          errorCode: 'INTERNAL_ERROR',
          reason: 'TOSS API 호출 중 오류가 발생했습니다.',
        },
      };
    }
  }

  async logoutByAccessToken(accessToken: string): Promise<void> {
    const url =
      '/api-partner/v1/apps-in-toss/user/oauth2/access/remove-by-access-token';

    logger.debug({ url }, 'TOSS API: 로그아웃 요청 (AccessToken)');

    try {
      await this.client.post(
        url,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      logger.debug({ url }, 'TOSS API: 로그아웃 성공');
    } catch (error: any) {
      logger.error(
        {
          url,
          statusCode: error.response?.status,
          error: error.response?.data || error.message,
        },
        'TOSS API: 로그아웃 실패',
      );

      if (error.response?.data) {
        throw error.response.data;
      }

      throw {
        resultType: 'FAIL',
        error: {
          errorCode: 'INTERNAL_ERROR',
          reason: 'TOSS API 호출 중 오류가 발생했습니다.',
        },
      };
    }
  }

  async logoutByUserKey(
    accessToken: string,
    userKey: number,
  ): Promise<{ resultType: string; success: { userKey: number } }> {
    const url =
      '/api-partner/v1/apps-in-toss/user/oauth2/access/remove-by-user-key';

    logger.debug({ url, userKey }, 'TOSS API: 로그아웃 요청 (userKey)');

    try {
      const response = await this.client.post<{
        resultType: string;
        success: { userKey: number };
      }>(
        url,
        { userKey },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      logger.debug({ url, userKey }, 'TOSS API: 로그아웃 성공');

      return response.data;
    } catch (error: any) {
      logger.error(
        {
          url,
          userKey,
          statusCode: error.response?.status,
          error: error.response?.data || error.message,
        },
        'TOSS API: 로그아웃 실패',
      );

      if (error.response?.data) {
        throw error.response.data;
      }

      throw {
        resultType: 'FAIL',
        error: {
          errorCode: 'INTERNAL_ERROR',
          reason: 'TOSS API 호출 중 오류가 발생했습니다.',
        },
      };
    }
  }
}

