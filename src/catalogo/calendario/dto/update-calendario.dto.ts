/**
 * Módulo: Catálogos - Calendario
 * Archivo: update-calendario.dto.ts
 * Descripción:
 * Define las propiedades permitidas para actualizar
 * un registro del calendario institucional.
 *
 * Desarrollado por: Missael Apaza
 */

import { PartialType } from '@nestjs/swagger';
import { CreateCalendarioDto } from './create-calendario.dto';

/**
 * DTO: UpdateCalendarioDto
 * Descripción:
 * Permite actualizar parcialmente un registro del calendario.
 *
 * Desarrollado por: Missael Apaza
 */
export class UpdateCalendarioDto extends PartialType(CreateCalendarioDto) {}
