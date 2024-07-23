import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthLoginDto, AuthSignupDto } from './auth.dto';
import { AuthService } from './auth.service';
import { Public } from '../shared/decorators/public.decoratos';
import { responseRequest } from '../shared/utils/response';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() authDto: AuthLoginDto) {
    const tokens = await this.authService.login(authDto);
    return responseRequest('success', 'Login success', tokens);
  }

  @Public()
  @Post('signup')
  async signup(@Body() authDto: AuthSignupDto) {
    const tokens = await this.authService.signup(authDto);
    return responseRequest('success', 'Signup success', tokens);
  }

  @Get('me')
  payload(@Req() req: any): any {
    return req.user;
  }
}
