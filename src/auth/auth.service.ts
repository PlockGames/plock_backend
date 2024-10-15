import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import {
  AuthCompleteSignUpDto,
  AuthLoginDto,
  AuthParitalSignupDto,
} from './auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '@prisma/client';
import { Tokens } from '../shared/interfaces/auth';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async login(authLoginDto: AuthLoginDto): Promise<Tokens> {
    this.logger.log(`Login attempt for email: ${authLoginDto.email}`);
    const user = await this.userService.findByEmail(authLoginDto.email);

    if (!user) {
      this.logger.warn(
        `Login failed for email: ${authLoginDto.email} - User not found`,
      );
      throw new ForbiddenException('Invalid credential');
    }

    const isMatch = await bcrypt.compare(authLoginDto.password, user.password);
    if (!isMatch) {
      this.logger.warn(
        `Login failed for email: ${authLoginDto.email} - Incorrect password`,
      );
      throw new ForbiddenException('Invalid credential');
    }

    this.logger.log(`Login success for user: ${user.id}`);
    const accessToken = await this.creationAccessToken(user);
    const refreshToken = await this.createRefreshToken(user);

    await this.userService.setRefreshToken(user.id, refreshToken);
    await this.userService.updateLastLogin(user.id);
    return { accessToken, refreshToken };
  }

  async partialSignUp(
    authParitalSignupDto: AuthParitalSignupDto,
  ): Promise<any> {
    this.logger.log(
      `Partial signup attempt for email: ${authParitalSignupDto.email}`,
    );
    const user = await this.userService.partialSignUp(authParitalSignupDto);

    this.logger.log(`Partial signup success for user: ${user.id}`);
    const accessToken = await this.creationAccessToken(user);
    const refreshToken = await this.createRefreshToken(user);

    await this.userService.setRefreshToken(user.id, refreshToken);
    await this.userService.updateLastLogin(user.id);
    return { accessToken, refreshToken };
  }

  public async completeSignUp(
    user: User,
    authCompleteSignUpDto: AuthCompleteSignUpDto,
  ) {
    this.logger.log(`Complete signup attempt for user: ${user.id}`);
    const updatedUser = await this.userService.update(
      user.id,
      authCompleteSignUpDto,
    );
    this.logger.log(`Complete signup success for user: ${user.id}`);
    return updatedUser;
  }

  public async creationAccessToken(user: User): Promise<string> {
    this.logger.log(`Creating access token for user: ${user.id}`);
    const payload = {
      sub: user.id,
      email: user.email,
    };
    return this.jwtService.signAsync(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
    });
  }

  public async createRefreshToken(user: User): Promise<string> {
    this.logger.log(`Creating refresh token for user: ${user.id}`);
    const payload = {
      sub: user.id,
      email: user.email,
    };
    return this.jwtService.signAsync(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
    });
  }

  public async verifyRefreshToken(refreshToken: string) {
    this.logger.log(`Verifying refresh token`);
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET,
      });
      const user = await this.userService.get(payload.sub);
      if (!user) {
        this.logger.warn(`Refresh token verification failed - User not found`);
        throw new ForbiddenException('Invalid token');
      }
      this.logger.log(`Refresh token verified for user: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`Invalid refresh token`, error.stack);
      throw new ForbiddenException('Invalid token');
    }
  }

  public async renewAccessToken(refreshToken: string) {
    this.logger.log('Renewing access token');
    const user = await this.verifyRefreshToken(refreshToken);
    const accessToken = await this.creationAccessToken(user as User);
    this.logger.log(`Access token renewed for user: ${user.id}`);
    return { accessToken };
  }
}
