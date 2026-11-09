import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtener los roles requeridos del decorador @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Si no hay roles requeridos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (request.apiToken) {
      const tokenPermissions = request.apiToken.permisos || [];
      if ((requiredPermissions || []).some((permission) =>
        tokenPermissions.includes(permission) || tokenPermissions.includes('*'),
      )) {
        return true;
      }

      throw new ForbiddenException('El token API no tiene permisos suficientes');
    }

    if (!user) {
      this.logger.warn('⚠️ Usuario no autenticado intentando acceder a ruta protegida');
      throw new UnauthorizedException('Usuario no autenticado');
    }

    const normalizedUserRoles = Array.isArray(user.roles)
      ? user.roles
      : typeof user.roles === 'string'
        ? user.roles.split(',').map((role) => role.trim()).filter(Boolean)
        : [];

    const normalizedRequiredRoles = requiredRoles
      .flatMap((role) => String(role).split(',').map((value) => value.trim()))
      .filter(Boolean);

    if (normalizedUserRoles.length === 0) {
      this.logger.warn(`⚠️ Usuario ${user.username} sin roles intentando acceder`);
      throw new ForbiddenException('No tiene permisos suficientes');
    }

    const hasRequiredRole = normalizedRequiredRoles.some((role) =>
      normalizedUserRoles.includes(role),
    );

    if (!hasRequiredRole) {
      this.logger.warn(
        `⚠️ Usuario ${user.username} con roles [${user.roles.join(', ')}] ` +
        `intentando acceder a ruta que requiere [${requiredRoles.join(', ')}]`,
      );
      throw new ForbiddenException('No tiene permisos suficientes para acceder a este recurso');
    }

    this.logger.debug(`✅ Usuario ${user.username} autorizado con roles [${user.roles.join(', ')}]`);
    return true;
  }
}