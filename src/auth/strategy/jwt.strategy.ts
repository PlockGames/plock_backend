import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, Logger } from '@nestjs/common';
import { Payload } from '../../shared/interfaces/auth';
import { UserService } from '../../user/user.service';
import { User } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.ACCESS_TOKEN_SECRET,
      ignoreExpiration: process.env.IGNORE_JWT_EXPIRATION === 'true',
    });
    this.logger.log('JwtStrategy initialized');
  }

  async validate(payload: Payload): Promise<Partial<User>> {
    this.logger.log(`Validating JWT for user with id: ${payload.sub}`);

    try {
      const user = await this.userService.get(payload.sub);

      if (!user) {
        this.logger.warn(`User with id: ${payload.sub} not found`);
        return null;
      }

      this.logger.log(`User with id: ${payload.sub} successfully validated`);
      return user;
    } catch (error) {
      this.logger.error(
        `Error validating user with id: ${payload.sub}`,
        error.stack,
      );
      throw error;
    }
  }
}
