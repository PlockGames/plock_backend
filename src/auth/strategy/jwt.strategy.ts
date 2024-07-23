import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Payload } from '../../shared/interfaces/auth';
import { UserService } from '../../user/user.service';
import { User } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.SECRET_JWT_TOKEN,
      ignoreExpiration: process.env.IGNORE_JWT_EXPIRATION === 'true',
    });
  }

  async validate(payload: Payload): Promise<Partial<User>> {
    return await this.userService.get(payload.sub);
  }
}
