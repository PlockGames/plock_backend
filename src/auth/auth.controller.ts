import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthLoginDto, AuthSignupDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { Public } from '../shared/decorators/public.decoratos';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup')
  async signup(@Body() authDto: AuthSignupDto) {
    return this.authService.signup(authDto);
  }

  @Public()
  @Post('login')
  async login(@Body() authDto: AuthLoginDto) {
    return this.authService.login(authDto);
  }

  @Get('me')
  payload(@Req() req: any): any {
    return req.user;
  }
}
