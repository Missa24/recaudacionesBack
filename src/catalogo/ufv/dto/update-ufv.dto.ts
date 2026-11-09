/**
 * Módulo: Catálogo - UFV
 * Archivo: update-ufv.dto.ts
 * Descripción:
 * Define los datos permitidos para actualizar un registro UFV.
 * Hereda las propiedades y validaciones de CreateUfvDto como opcionales.
 *
 * Desarrollado por: Missael Apaza
 */

import { PartialType } from '@nestjs/swagger';
import { CreateUfvDto } from './create-ufv.dto';

/**
 * DTO: UpdateUfvDto
 * Descripción:
 * Permite modificar parcialmente la fecha y el valor de un registro UFV.
 *
 * Desarrollado por: Missael Apaza
 */
export class UpdateUfvDto extends PartialType(CreateUfvDto) {}
