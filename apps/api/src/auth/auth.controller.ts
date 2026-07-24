import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('kakao/login')
  loginWithKakao(@Body('kakaoAccessToken') kakaoAccessToken: string) {
    return this.authService.loginWithKakao(kakaoAccessToken);
  }
}
