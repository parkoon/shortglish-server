import { Router, Request, Response } from 'express';
import { body, query } from 'express-validator';
import { TossService } from '../services/toss.service';
import { tossTokenAuth, AuthRequest, basicAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();
const tossService = new TossService();

// POST /toss/token
router.post(
  '/token',
  validate([
    body('authorizationCode')
      .isString()
      .notEmpty()
      .withMessage('인가 코드는 필수입니다.'),
    body('referrer')
      .isString()
      .notEmpty()
      .withMessage('리퍼러는 필수입니다.'),
  ]),
  async (req: Request, res: Response) => {
    try {
      const { authorizationCode, referrer } = req.body;
      const result = await tossService.generateToken(authorizationCode, referrer);
      res.json(result);
    } catch (error: any) {
      res.status(400).json(error);
    }
  },
);

// POST /toss/refresh
router.post(
  '/refresh',
  validate([
    body('refreshToken')
      .isString()
      .notEmpty()
      .withMessage('리프레시 토큰은 필수입니다.'),
  ]),
  async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;
      const result = await tossService.refreshToken(refreshToken);
      res.json(result);
    } catch (error: any) {
      res.status(400).json(error);
    }
  },
);

// GET /toss/me
router.get('/me', tossTokenAuth, async (req: AuthRequest, res: Response) => {
  try {
    const accessToken = req.accessToken!;
    const result = await tossService.getUserInfo(accessToken);
    res.json(result);
  } catch (error: any) {
    res.status(400).json(error);
  }
});

// POST /toss/decrypt
router.post(
  '/decrypt',
  validate([
    body('encryptedData')
      .isString()
      .notEmpty()
      .withMessage('암호화된 데이터는 필수입니다.'),
  ]),
  async (req: Request, res: Response) => {
    try {
      const { decrypt } = await import('../utils/decrypt.util');
      const { encryptedData } = req.body;
      const decrypted = decrypt(encryptedData);
      res.json({
        resultType: 'SUCCESS',
        success: {
          decryptedData: decrypted,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        resultType: 'FAIL',
        error: {
          errorCode: 'DECRYPT_ERROR',
          reason: error.message || '복호화에 실패했습니다.',
        },
      });
    }
  },
);

// POST /toss/decrypt-user-info
router.post('/decrypt-user-info', async (req: Request, res: Response) => {
  try {
    const result = await tossService.decryptUserInfo(req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json(error);
  }
});

// POST /toss/logout
router.post('/logout', tossTokenAuth, async (req: AuthRequest, res: Response) => {
  try {
    const accessToken = req.accessToken!;
    await tossService.logout(accessToken);
    res.json({
      resultType: 'SUCCESS',
      success: {
        message: '로그아웃되었습니다.',
      },
    });
  } catch (error: any) {
    res.status(400).json(error);
  }
});

// POST /toss/logout-by-user-key
router.post(
  '/logout-by-user-key',
  tossTokenAuth,
  validate([
    body('userKey')
      .isInt()
      .withMessage('사용자 키는 숫자여야 합니다.')
      .notEmpty()
      .withMessage('사용자 키는 필수입니다.'),
  ]),
  async (req: AuthRequest, res: Response) => {
    try {
      const accessToken = req.accessToken!;
      const { userKey } = req.body;
      const result = await tossService.logoutByUserKey(accessToken, userKey);
      res.json(result);
    } catch (error: any) {
      res.status(400).json(error);
    }
  },
);

// GET /toss/callback
router.get(
  '/callback',
  basicAuth,
  validate([
    query('userKey')
      .optional()
      .isInt()
      .withMessage('사용자 키는 숫자여야 합니다.'),
    query('referrer')
      .optional()
      .isString()
      .withMessage('리퍼러는 문자열이어야 합니다.'),
  ]),
  async (req: Request, res: Response) => {
    const { userKey, referrer } = req.query;
    res.json({
      resultType: 'SUCCESS',
      success: {
        message: '콜백이 수신되었습니다.',
        userKey: userKey ? Number(userKey) : undefined,
        referrer: referrer ? String(referrer) : undefined,
      },
    });
  },
);

// POST /toss/callback
router.post(
  '/callback',
  basicAuth,
  validate([
    body('userKey')
      .optional()
      .isInt()
      .withMessage('사용자 키는 숫자여야 합니다.'),
    body('referrer')
      .optional()
      .isString()
      .withMessage('리퍼러는 문자열이어야 합니다.'),
  ]),
  async (req: Request, res: Response) => {
    const { userKey, referrer } = req.body;
    res.json({
      resultType: 'SUCCESS',
      success: {
        message: '콜백이 수신되었습니다.',
        userKey,
        referrer,
      },
    });
  },
);

export default router;

