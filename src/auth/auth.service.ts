import {
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AuthCompleteSignUpDto,
  AuthGoogleIdTokenDto,
  AuthLoginDto,
  AuthParitalSignupDto,
} from './auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { UserService } from '../user/user.service';
import { User } from '@prisma/client';
import { Tokens } from '../shared/interfaces/auth';
import { UserOAuthCreateDto } from '../user/user.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  private googleClient: OAuth2Client;

  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

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

  // --- Method to handle Google Login/Signup ---
  async handleGoogleLogin(googleUser: {
    email: string;
    firstName?: string;
    lastName?: string;
    picture?: string;
  }): Promise<Tokens> {
    this.logger.log(`Handling Google login for email: ${googleUser.email}`);
    let user = await this.userService.findByEmail(googleUser.email);

    if (!user) {
      this.logger.log(
        `User not found for email ${googleUser.email}, creating new OAuth user.`,
      );
      const oauthDto: UserOAuthCreateDto = {
        email: googleUser.email,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        pofilePic: googleUser.picture,
      };
      user = await this.userService.createOAuthUser(oauthDto);
      this.logger.log(`New OAuth user created: ${user.id}`);
    } else {
      this.logger.log(`Existing user found for Google login: ${user.id}`);
    }

    const accessToken = await this.creationAccessToken(user);
    const refreshToken = await this.createRefreshToken(user);

    await this.userService.setRefreshToken(user.id, refreshToken);
    await this.userService.updateLastLogin(user.id);

    this.logger.log(`Tokens generated for Google user: ${user.id}`);
    return { accessToken, refreshToken };
  }

  // --- Method to verify Google ID Token and Login/Signup (for Mobile) ---
  async verifyGoogleIdTokenAndLogin(
    googleIdTokenDto: AuthGoogleIdTokenDto,
  ): Promise<Tokens> {
    this.logger.log('Verifying Google ID token from mobile app');
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: googleIdTokenDto.idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      if (!payload || !payload.email) {
        this.logger.error('Invalid Google ID token payload received');
        throw new UnauthorizedException('Invalid Google token');
      }

      this.logger.log(`Google ID token verified for email: ${payload.email}`);

      const googleUser = {
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        picture: payload.picture,
      };

      return this.handleGoogleLogin(googleUser);
    } catch (error) {
      this.logger.error('Google ID token verification failed:', error);
      throw new UnauthorizedException('Google authentication failed');
    }
  }
}
