import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorador para asignar roles requeridos a una ruta
 * @param roles - Lista de roles permitidos
 * @example
 * @Roles('admin', 'super_admin')
 * @Get()
 * async findAll() { ... }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);