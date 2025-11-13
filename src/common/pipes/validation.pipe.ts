import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const messages = errors.map((error) => {
        const constraints = error.constraints || {};
        const translatedMessages = Object.values(constraints).map((message: string) => {
          // class-validator 기본 메시지를 한글로 변환
          return this.translateMessage(message, error.property);
        });
        return translatedMessages.join(', ');
      });

      throw new BadRequestException({
        resultType: 'FAIL',
        error: {
          errorCode: 'VALIDATION_ERROR',
          reason: `입력값 검증에 실패했습니다: ${messages.join('; ')}`,
        },
      });
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private translateMessage(message: string, property: string): string {
    // class-validator 기본 메시지를 한글로 변환
    const translations: { [key: string]: string } = {
      'must be a string': '문자열이어야 합니다',
      'should not be empty': '비어있을 수 없습니다',
      'must be a number': '숫자여야 합니다',
      'must be an email': '올바른 이메일 형식이어야 합니다',
      'must be a boolean': '불린 값이어야 합니다',
      'must be an array': '배열이어야 합니다',
      'must be a valid enum value': '유효한 열거형 값이어야 합니다',
      'must be a valid date': '유효한 날짜여야 합니다',
      'must be a valid URL': '유효한 URL이어야 합니다',
      'must be a valid UUID': '유효한 UUID여야 합니다',
      'must be longer than or equal to': '길이가 이상이어야 합니다',
      'must be shorter than or equal to': '길이가 이하여야 합니다',
      'must match': '형식이 일치해야 합니다',
    };

    // 기본 메시지 변환
    let translated = message;
    for (const [key, value] of Object.entries(translations)) {
      if (translated.includes(key)) {
        translated = translated.replace(key, value);
      }
    }

    // 속성명을 한글로 변환 (필요시)
    const propertyTranslations: { [key: string]: string } = {
      authorizationCode: '인가 코드',
      referrer: '리퍼러',
      refreshToken: '리프레시 토큰',
      encryptedData: '암호화된 데이터',
      fieldName: '필드명',
      userKey: '사용자 키',
    };

    const propertyName = propertyTranslations[property] || property;

    // 속성명이 메시지에 포함되어 있으면 한글로 변환
    if (translated.includes(property)) {
      translated = translated.replace(property, propertyName);
    }

    return translated;
  }
}

