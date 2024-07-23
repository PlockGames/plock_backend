import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Payload } from "../dto/auth.dto";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.SECRET_JWT_TOKEN,
      ignoreExpiration: process.env.IGNORE_JWT_EXPIRATION === 'true',
    });
  }

  async validate(payload: Payload) {
    return payload;
  }
}
