import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class CallbackDto {
  @IsNumber()
  @IsNotEmpty()
  userKey: number;

  @IsString()
  @IsNotEmpty()
  referrer: string;
}

