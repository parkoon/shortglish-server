import { IsNumber, IsNotEmpty } from 'class-validator';

export class LogoutByUserKeyDto {
  @IsNumber()
  @IsNotEmpty()
  userKey: number;
}

