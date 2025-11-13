import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

export function validate(validations: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map((validation) => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const messages = errors
        .array()
        .map((error) => {
          const msg = error.msg;
          // 한글 변환
          const translations: { [key: string]: string } = {
            'must be a string': '문자열이어야 합니다',
            'should not be empty': '비어있을 수 없습니다',
            'must be a number': '숫자여야 합니다',
            'must be an email': '올바른 이메일 형식이어야 합니다',
            'must be a boolean': '불린 값이어야 합니다',
            'must be an array': '배열이어야 합니다',
          };

          let translated = msg;
          for (const [key, value] of Object.entries(translations)) {
            if (translated.includes(key)) {
              translated = translated.replace(key, value);
            }
          }

          return translated;
        })
        .join('; ');

      return res.status(400).json({
        resultType: 'FAIL',
        error: {
          errorCode: 'VALIDATION_ERROR',
          reason: `입력값 검증에 실패했습니다: ${messages}`,
        },
      });
    }

    next();
  };
}

