import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import {
  AuthCompleteSignUpDto,
  AuthLoginDto,
  AuthParitalSignupDto,
  AuthRefreshTokenDto,
} from './auth.dto';
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
  UpdateUserResponse,
} from '../shared/swagger/responses';
import { Request } from 'express';
import { User } from '@prisma/client';

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

  @ApiBody({
    description: 'Complete sign up credentials',
    type: AuthCompleteSignUpDto,
  })
  @ApiResponse(UpdateUserResponse)
  @ApiOperation({
    summary: 'Complete sign up',
    description: 'Complete sign up',
  })
  @Post('signup/complete')
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
  @ApiResponse({
    status: 200,
    description: 'The user access token',
    schema: {
      properties: {
        accessToken: {
          type: 'string',
        },
      },
    },
  })
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
  @ApiResponse(AuthMeResponse)
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Get user profile',
  })
  payload(@Req() req: any): any {
    return req.user;
  }
}
