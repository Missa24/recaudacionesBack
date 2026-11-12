import { PartialType } from '@nestjs/swagger';
import { CreateModuloDto } from './create-modulo.dto';

/**
 * Módulo: Seguridad - Módulo
 * Archivo: update-modulo.dto.ts
 *
 * Permite actualizar parcialmente los datos de un módulo.
 */
export class UpdateModuloDto extends PartialType(CreateModuloDto) {}
