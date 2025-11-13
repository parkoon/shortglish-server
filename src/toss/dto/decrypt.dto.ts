import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class DecryptDto {
  @IsString()
  @IsNotEmpty()
  encryptedData: string;

  @IsString()
  @IsOptional()
  fieldName?: string;
}

