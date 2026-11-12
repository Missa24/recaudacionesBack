/**
 * Módulo: Seguridad - UsuarioRol
 * Archivo: update-usuario-rol.dto.ts
 * Descripción:
 * Define los datos permitidos para actualizar parcialmente
 * una asignación de rol.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */

import { PartialType } from '@nestjs/swagger';
import { CreateUsuarioRolDto } from './create-usuario-rol.dto';

/**
 * DTO: UpdateUsuarioRolDto
 * Descripción:
 * Permite modificar parcialmente el usuario o rol asignado.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */
export class UpdateUsuarioRolDto extends PartialType(CreateUsuarioRolDto) {}
