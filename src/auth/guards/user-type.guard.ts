import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { USER_TYPE_KEY } from '../../shared/decorators/user-type.decorator';
import { User } from '@prisma/client';

@Injectable()
export class UserTypeGuard implements CanActivate {
  private readonly logger = new Logger(UserTypeGuard.name);

  constructor(private reflector: Reflector) {
    this.logger.log('UserTypeGuard initialized');
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const handler = context.getHandler().name;
    const controller = context.getClass().name;
    this.logger.log(
      `Evaluating access for handler: ${handler} in controller: ${controller}`,
    );

    const userTypes = this.reflector.getAllAndOverride<string[]>(
      USER_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!userTypes) {
      this.logger.warn(
        `No user types specified for handler: ${handler}. Access allowed by default.`,
      );
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as User;

    if (!user) {
      this.logger.error(
        `No user found in request for handler: ${handler}. Access denied.`,
      );
      return false;
    }

    this.logger.log(`User role: ${user.role}`);

    const hasAccess = userTypes.some((type) => type === user.role);

    if (hasAccess) {
      this.logger.log(
        `Access granted to user with role: ${user.role} for handler: ${handler}`,
      );
    } else {
      this.logger.warn(
        `Access denied to user with role: ${user.role} for handler: ${handler}`,
      );
    }

    return hasAccess;
  }
}
