import { PartialType } from '@nestjs/swagger';
import { CreateRolModuloPermisoDto } from './create-rol-modulo-permiso.dto';

export class UpdateRolModuloPermisoDto extends PartialType(
  CreateRolModuloPermisoDto,
) {}
