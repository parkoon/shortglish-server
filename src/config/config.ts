import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  toss: {
    apiBaseUrl: process.env.TOSS_API_BASE_URL || 'https://apps-in-toss-api.toss.im',
    decryptKey: (() => {
      const key = process.env.TOSS_DECRYPT_KEY;
      if (!key) {
        throw new Error('TOSS_DECRYPT_KEY 환경 변수가 필요합니다.');
      }
      return key;
    })(),
    decryptAad: (() => {
      const aad = process.env.TOSS_DECRYPT_AAD;
      if (!aad) {
        throw new Error('TOSS_DECRYPT_AAD 환경 변수가 필요합니다.');
      }
      return aad;
    })(),
    callbackBasicAuth: {
      username: process.env.TOSS_CALLBACK_BASIC_AUTH_USERNAME,
      password: process.env.TOSS_CALLBACK_BASIC_AUTH_PASSWORD,
    },
  },
} as const;

