import * as crypto from 'crypto';
import { ConfigService } from '../../config/config.service';

export class DecryptUtil {
  private static readonly IV_LENGTH = 12;
  private static readonly TAG_LENGTH = 16;
  private static readonly GCM_TAG_LENGTH = 128; // 16 bytes in bits

  static decrypt(
    encryptedText: string,
    configService: ConfigService,
  ): string {
    const base64EncodedAesKey = configService.tossDecryptKey;
    const aad = configService.tossDecryptAad;

    const decoded = Buffer.from(encryptedText, 'base64');
    const keyByteArray = Buffer.from(base64EncodedAesKey, 'base64');
    const iv = decoded.subarray(0, DecryptUtil.IV_LENGTH);
    const ciphertextWithTag = decoded.subarray(DecryptUtil.IV_LENGTH);

    const tag = ciphertextWithTag.subarray(-DecryptUtil.TAG_LENGTH);
    const ciphertext = ciphertextWithTag.subarray(
      0,
      ciphertextWithTag.length - DecryptUtil.TAG_LENGTH,
    );

    const decipher = crypto.createDecipheriv('aes-256-gcm', keyByteArray, iv);
    decipher.setAuthTag(tag);
    decipher.setAAD(Buffer.from(aad));

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }
}

