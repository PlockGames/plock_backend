import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  AuthCompleteSignUpDto,
  AuthGoogleIdTokenDto,
  AuthLoginDto,
  AuthParitalSignupDto,
  AuthRefreshTokenDto,
  AuthRefreshTokenResponseDto,
  AuthResponseDto,
} from './auth.dto';
import { AuthService } from './auth.service';
import { Public } from '../shared/decorators/public.decoratos';
import { responseRequest } from '../shared/utils/response';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { User } from '@prisma/client';
import { UserDto } from '../user/user.dto';
import { ResponseOneSchema } from '../shared/decorators/response-one.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiBody({
    description: 'Login credentials',
    type: AuthLoginDto,
  })
  @ResponseOneSchema(AuthResponseDto)
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
  @ResponseOneSchema(AuthResponseDto)
  @ApiOperation({ summary: 'Partial sign up', description: 'Partial sign up' })
  @Public()
  async signup(@Body() authDto: AuthParitalSignupDto) {
    const tokens = await this.authService.partialSignUp(authDto);
    return responseRequest('success', 'Signup success', tokens);
  }

  @Post('signup/complete')
  @ApiBearerAuth('JWT-auth')
  @ApiBody({
    description: 'Complete sign up credentials',
    type: AuthCompleteSignUpDto,
  })
  @ResponseOneSchema(UserDto)
  @ApiOperation({
    summary: 'Complete sign up',
    description: 'Complete sign up',
  })
  async completeSignUp(
    @Req() req: Request,
    @Body() authDto: AuthCompleteSignUpDto,
  ) {
    const completeSignUp = await this.authService.completeSignUp(
      req.user as User,
      authDto,
    );
    return responseRequest(
      'success',
      'Complete signup success',
      completeSignUp,
    );
  }

  @Post('refreshtoken')
  @ApiBody({
    description: 'Refresh token',
    type: AuthRefreshTokenDto,
  })
  @ResponseOneSchema(AuthRefreshTokenResponseDto)
  @ApiOperation({
    summary: 'Renew access token',
    description: 'Renew access token',
  })
  @Public()
  async renew(@Body() refreshToken: AuthRefreshTokenDto) {
    const accessToken = await this.authService.renewAccessToken(
      refreshToken.refreshToken,
    );
    return responseRequest('success', 'Token renewed', accessToken);
  }

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ResponseOneSchema(UserDto)
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Get user profile',
  })
  payload(@Req() req: any): any {
    return responseRequest('success', 'User profile', req.user);
  }

  // --- Google OAuth Routes ---

  @Get('google')
  @Public()
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  async googleAuth(@Req() req: Request) {}

  @Get('google/callback')
  @Public()
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback handler' })
  @ResponseOneSchema(AuthResponseDto)
  async googleAuthRedirect(@Req() req: Request & { user: any }) {
    const tokens = await this.authService.handleGoogleLogin(req.user);
    return responseRequest('success', 'Google login successful', tokens);
  }

  // --- Endpoint for Mobile Google Sign-In (ID Token Verification) ---
  @Post('google/verify-token')
  @Public()
  @ApiOperation({ summary: 'Verify Google ID Token from Mobile App' })
  @ApiBody({ type: AuthGoogleIdTokenDto })
  @ResponseOneSchema(AuthResponseDto)
  async verifyGoogleToken(@Body() googleIdTokenDto: AuthGoogleIdTokenDto) {
    const tokens =
      await this.authService.verifyGoogleIdTokenAndLogin(googleIdTokenDto);
    return responseRequest(
      'success',
      'Google token verification successful',
      tokens,
    );
  }
}
