import { IsString, IsNotEmpty } from 'class-validator';

export class GenerateTokenDto {
  @IsString()
  @IsNotEmpty()
  authorizationCode: string;

  @IsString()
  @IsNotEmpty()
  referrer: string;
}

