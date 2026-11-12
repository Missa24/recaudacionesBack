import { PartialType } from '@nestjs/swagger';
import { CreateRolModuloPermisoDto } from './create-rol-modulo-permiso.dto';

/**
 * Módulo: Seguridad - RolModuloPermiso
 * Archivo: update-rol-modulo-permiso.dto.ts
 *
 * Permite actualizar parcialmente la combinación
 * de rol, módulo y permiso.
 */
export class UpdateRolModuloPermisoDto extends PartialType(
  CreateRolModuloPermisoDto,
) {}
