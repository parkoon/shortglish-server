import * as crypto from 'crypto';
import { config } from '../config/config';

const IV_LENGTH = 12;
const TAG_LENGTH = 16;

export function decrypt(encryptedText: string): string {
  const decoded = Buffer.from(encryptedText, 'base64');
  const keyByteArray = Buffer.from(config.toss.decryptKey, 'base64');
  const iv = decoded.subarray(0, IV_LENGTH);
  const ciphertextWithTag = decoded.subarray(IV_LENGTH);

  const tag = ciphertextWithTag.subarray(-TAG_LENGTH);
  const ciphertext = ciphertextWithTag.subarray(
    0,
    ciphertextWithTag.length - TAG_LENGTH,
  );

  const decipher = crypto.createDecipheriv('aes-256-gcm', keyByteArray, iv);
  decipher.setAuthTag(tag);
  decipher.setAAD(Buffer.from(config.toss.decryptAad));

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

