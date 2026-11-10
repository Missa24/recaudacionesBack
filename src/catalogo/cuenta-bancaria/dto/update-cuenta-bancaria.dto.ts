/**
 * Módulo: Catálogos - Cuentas Bancarias
 * Archivo: update-cuenta-bancaria.dto.ts
 * Descripción:
 * Define los datos y las validaciones necesarias para actualizar
 * una cuenta bancaria registrada en el sistema.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */

import { PartialType } from '@nestjs/swagger';
import { CreateCuentaBancariaDto } from './create-cuenta-bancaria.dto';

/**
 * DTO para la actualización de una cuenta bancaria.
 * Permite modificar parcialmente los datos del registro.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export class UpdateCuentaBancariaDto extends PartialType(
  CreateCuentaBancariaDto,
) {}
