import { PartialType } from '@nestjs/swagger';
import { CreatePermisoDto } from './create-permiso.dto';

/**
 * Edición parcial. No permite null en los campos obligatorios.
 * Desarrollado por: Oscar Canchari.
 */
export class UpdatePermisoDto extends PartialType(CreatePermisoDto, {}) {}
