import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthLoginDto, AuthParitalSignupDto } from './auth.dto';
import { AuthService } from './auth.service';
import { Public } from '../shared/decorators/public.decoratos';
import { responseRequest } from '../shared/utils/response';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  AuthLoginResponse,
  AuthMeResponse,
  AuthSignupResponse,
} from '../shared/swagger/responses';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiBody({
    description: 'Login credentials',
    type: AuthLoginDto,
  })
  @ApiResponse(AuthLoginResponse)
  @ApiOperation({ summary: 'Login', description: 'Login' })
  @Public()
  async login(@Body() authDto: AuthLoginDto) {
    const tokens = await this.authService.login(authDto);
    return responseRequest('success', 'Login success', tokens);
  }

  @Post('signup')
  @ApiBody({
    description: 'Sign up credentials',
    type: AuthParitalSignupDto,
  })
  @ApiResponse(AuthSignupResponse)
  @ApiOperation({ summary: 'Partial sign up', description: 'Partial sign up' })
  @Public()
  async signup(@Body() authDto: AuthParitalSignupDto) {
    const tokens = await this.authService.partialSignUp(authDto);
    return responseRequest('success', 'Signup success', tokens);
  }

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiResponse(AuthMeResponse)
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Get user profile',
  })
  payload(@Req() req: any): any {
    return req.user;
  }
}
