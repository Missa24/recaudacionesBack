/**
 * Módulo: Seguridad - Rol
 * Archivo: update-rol.dto.ts
 * Descripción:
 * Define los datos permitidos para actualizar parcialmente
 * un registro de rol.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */

import { PartialType } from '@nestjs/swagger';
import { CreateRolDto } from './create-rol.dto';

/**
 * DTO: UpdateRolDto
 * Descripción:
 * Permite modificar parcialmente los datos de un rol,
 * heredando las validaciones de CreateRolDto.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */
export class UpdateRolDto extends PartialType(CreateRolDto) {}
