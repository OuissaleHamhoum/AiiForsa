import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Role, ROLES_KEY } from '../decorators/roles.decorator';
import { AuthUser } from './jwt-auth.guard'; // importe le type AuthUser

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthUser }>();

    const user = request.user;
    if (!user) return false;

    // cast pour TS et Prisma enum compatible
    return requiredRoles.includes(user.role as Role);
  }
}
