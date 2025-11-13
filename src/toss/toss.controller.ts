import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TossService } from './toss.service';
import { TossTokenGuard } from './guards/toss-token.guard';
import { BasicAuthGuard } from './guards/basic-auth.guard';
import { GenerateTokenDto } from './dto/generate-token.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { DecryptDto } from './dto/decrypt.dto';
import { LogoutByUserKeyDto } from './dto/logout.dto';
import { CallbackDto } from './dto/callback.dto';

@Controller('toss')
export class TossController {
  constructor(private readonly tossService: TossService) {}

  @Post('token')
  @HttpCode(HttpStatus.OK)
  async generateToken(@Body() dto: GenerateTokenDto) {
    return this.tossService.generateToken(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.tossService.refreshToken(dto);
  }

  @Get('me')
  @UseGuards(TossTokenGuard)
  async getUserInfo(@Request() req: any) {
    const accessToken = req.accessToken;
    return this.tossService.getUserInfo(accessToken);
  }

  @Post('decrypt')
  @HttpCode(HttpStatus.OK)
  async decrypt(@Body() dto: DecryptDto) {
    const decrypted = await this.tossService.decrypt(dto);
    return {
      resultType: 'SUCCESS',
      success: {
        decryptedData: decrypted,
      },
    };
  }

  @Post('decrypt-user-info')
  @HttpCode(HttpStatus.OK)
  async decryptUserInfo(@Body() userInfo: any) {
    return this.tossService.decryptUserInfo(userInfo);
  }

  @Post('logout')
  @UseGuards(TossTokenGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: any) {
    const accessToken = req.accessToken;
    await this.tossService.logout(accessToken);
    return {
      resultType: 'SUCCESS',
      success: {
        message: '로그아웃되었습니다.',
      },
    };
  }

  @Post('logout-by-user-key')
  @UseGuards(TossTokenGuard)
  @HttpCode(HttpStatus.OK)
  async logoutByUserKey(
    @Request() req: any,
    @Body() dto: LogoutByUserKeyDto,
  ) {
    const accessToken = req.accessToken;
    return this.tossService.logoutByUserKey(accessToken, dto);
  }

  @Get('callback')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.OK)
  async callbackGet(@Query() query: CallbackDto) {
    // 콜백 처리 로직 (필요시 구현)
    return {
      resultType: 'SUCCESS',
      success: {
        message: '콜백이 수신되었습니다.',
        userKey: query.userKey,
        referrer: query.referrer,
      },
    };
  }

  @Post('callback')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.OK)
  async callbackPost(@Body() dto: CallbackDto) {
    // 콜백 처리 로직 (필요시 구현)
    return {
      resultType: 'SUCCESS',
      success: {
        message: '콜백이 수신되었습니다.',
        userKey: dto.userKey,
        referrer: dto.referrer,
      },
    };
  }
}

