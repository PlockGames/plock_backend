import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthLoginDto, AuthParitalSignupDto } from './auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { User } from '@prisma/client';
import { Tokens } from '../shared/interfaces/auth';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async login(authLoginDto: AuthLoginDto): Promise<Tokens> {
    const user = await this.userService.findByEmail(authLoginDto.email);
    if (!user) throw new ForbiddenException('Invalid credential');
    const isMatch = await bcrypt.compare(authLoginDto.password, user.password);
    if (!isMatch) throw new ForbiddenException('Invalid credential');
    const accessToken = await this.creationAccessToken(user);
    const refreshToken = await this.refreshToken(user);
    await this.userService.setRefreshToken(user.id, refreshToken);
    await this.userService.updateLastLogin(user.id);
    return { accessToken, refreshToken };
  }

  async partialSignUp(
    authParitalSignupDto: AuthParitalSignupDto,
  ): Promise<any> {
    const user = await this.userService.partialSignUp(authParitalSignupDto);
    const accessToken = await this.creationAccessToken(user);
    const refreshToken = await this.refreshToken(user);
    await this.userService.setRefreshToken(user.id, refreshToken);
    await this.userService.updateLastLogin(user.id);
    return { accessToken, refreshToken };
  }

  public async creationAccessToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
    };
    return this.jwtService.signAsync(payload, {
      secret: process.env.ACCESS_TOKEN_SECRET,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
    });
  }

  public async refreshToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
    };
    return this.jwtService.signAsync(payload, {
      secret: process.env.REFRESH_TOKEN_SECRET,
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
    });
  }
}
