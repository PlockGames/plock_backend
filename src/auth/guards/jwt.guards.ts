import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../shared/decorators/public.decoratos';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
    this.logger.log('JwtAuthGuard initialized');
  }

  canActivate(context: ExecutionContext) {
    const handler = context.getHandler().name;
    const controller = context.getClass().name;
    this.logger.log(
      `Checking access for handler: ${handler} in controller: ${controller}`,
    );

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      this.logger.warn(`Public route accessed: ${handler}`);
      return true;
    }

    const canActivate = super.canActivate(context);
    if (!canActivate) {
      this.logger.error(
        `Access denied to: ${handler} in controller: ${controller}`,
      );
    } else {
      this.logger.log(`Access granted to: ${handler}`);
    }

    return canActivate;
  }
}
