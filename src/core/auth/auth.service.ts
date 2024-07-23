import { ForbiddenException, Injectable } from '@nestjs/common';
import { AccessToken, AuthLoginDto, AuthSignupDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async signup(dto: AuthSignupDto): Promise<any> {    
    const hash = await bcrypt.hash(dto.password, 12);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phoneNumber: dto.phoneNumber,
        },
      });
      delete user.password;
      return user;
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
    }
  }

  async login(dto: AuthLoginDto): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) throw new ForbiddenException('Invalid credential');
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new ForbiddenException('Invalid credential');
    delete user.password;

    return this.creationAccessToken(user.id);
  }

  async creationAccessToken(userId: number): Promise<AccessToken> {
    const payload = {
      sub: userId,
    };

    const accessToken: string = await this.jwt.signAsync(payload, {
      expiresIn: '1h',
      secret: process.env.SECRET_JWT_TOKEN,
    });

    return { accessToken };
  }
}
