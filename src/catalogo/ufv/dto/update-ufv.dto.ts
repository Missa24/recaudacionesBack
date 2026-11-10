/**
 * Módulo: Catálogo - UFV
 * Archivo: update-ufv.dto.ts
 * Descripción:
 * Define los datos permitidos para actualizar un registro UFV.
 * Hereda las propiedades y validaciones de CreateUfvDto como opcionales.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */

import { PartialType } from '@nestjs/swagger';
import { CreateUfvDto } from './create-ufv.dto';

/**
 * DTO: UpdateUfvDto
 * Descripción:
 * Permite modificar parcialmente la fecha y el valor de un registro UFV.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export class UpdateUfvDto extends PartialType(CreateUfvDto) {}
