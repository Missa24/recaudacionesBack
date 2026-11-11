import { PartialType } from '@nestjs/swagger';
import { CreateRolDto } from './create-rol.dto';

/**
 * Edición parcial. No permite null en los campos obligatorios.
 * Desarrollado por: Oscar Canchari.
 */
export class UpdateRolDto extends PartialType(CreateRolDto, {
  skipNullProperties: false,
}) {}
