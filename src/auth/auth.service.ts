import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthLoginDto, AuthSignupDto } from './auth.dto';
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

  async login(dto: AuthLoginDto): Promise<Tokens> {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) throw new ForbiddenException('Invalid credential');
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new ForbiddenException('Invalid credential');
    const accessToken = await this.creationAccessToken(user);
    const refreshToken = await this.refreshToken(user);
    await this.userService.setRefreshToken(user.id, refreshToken);
    await this.userService.updateLastLogin(user.id);
    return { accessToken, refreshToken };
  }

  async signup(dto: AuthSignupDto): Promise<any> {
    const hash = await bcrypt.hash(dto.password, 12);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hash,
          username: dto.username,
        },
      });
      const accessToken = await this.creationAccessToken(user);
      const refreshToken = await this.refreshToken(user);
      await this.userService.setRefreshToken(user.id, refreshToken);
      await this.userService.updateLastLogin(user.id);
      return { accessToken, refreshToken };
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
    }
  }

  public async creationAccessToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
    };
    return this.jwtService.signAsync(payload, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
      secret: process.env.SECRET_JWT_TOKEN,
    });
  }

  public async refreshToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
    };
    return this.jwtService.signAsync(payload, {
      secret: process.env.SECRET_JWT_TOKEN,
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
    });
  }
}
