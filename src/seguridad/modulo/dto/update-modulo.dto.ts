import { PartialType } from '@nestjs/swagger';
import { CreateModuloDto } from './create-modulo.dto';

/**
 * Edición parcial. No permite null en los campos obligatorios.
 * Desarrollado por: Oscar Canchari.
 */
export class UpdateModuloDto extends PartialType(CreateModuloDto, {
  skipNullProperties: false,
}) {}
