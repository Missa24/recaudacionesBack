/**
 * Módulo: Catálogos - Cuentas Bancarias
 * Archivo: create-cuenta-bancaria.dto.ts
 * Descripción:
 * Define los datos y las validaciones necesarias para registrar
 * una cuenta bancaria en el sistema.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';

/**
 * DTO para la creación de una cuenta bancaria.
 * Establece los campos obligatorios y opcionales del registro,
 * junto con sus respectivas reglas de validación.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export class CreateCuentaBancariaDto {
  /**
   * Identificador del banco al que pertenece la cuenta.
   */
  @ApiProperty({
    example: '380b9ef8-2fc4-425e-8572-57a8d72a263c',
    description: 'Identificador del banco.',
  })
  @IsUUID('4', { message: 'El identificador del banco no es válido' })
  id_banco!: string;

  /**
   * Número de cuenta bancaria.
   */
  @ApiProperty({
    example: '1234567890',
    maxLength: 50,
    description: 'Número de cuenta bancaria.',
  })
  @IsString({ message: 'El número de cuenta debe ser un texto' })
  @Matches(/\S/, {
    message: 'El número de cuenta no puede estar vacío',
  })
  @MaxLength(50, {
    message: 'El número de cuenta no debe superar los 50 caracteres',
  })
  nro_cuenta!: string;

  /**
   * Nombre o denominación de la cuenta bancaria.
   */
  @ApiProperty({
    example: 'Cuenta recaudadora institucional',
    maxLength: 150,
    description: 'Nombre o denominación de la cuenta bancaria.',
  })
  @IsString({ message: 'El nombre de la cuenta debe ser un texto' })
  @Matches(/\S/, {
    message: 'El nombre de la cuenta no puede estar vacío',
  })
  @MaxLength(150, {
    message: 'El nombre de la cuenta no debe superar los 150 caracteres',
  })
  nombre_cuenta!: string;

  /**
   * Identificador de la dependencia asociada a la cuenta.
   */
  @ApiPropertyOptional({
    example: '646b0b24-4ca2-4cdd-89df-082046f76352',
    nullable: true,
    description: 'Identificador de la dependencia asociada a la cuenta.',
  })
  @IsOptional()
  @IsUUID('4', {
    message: 'El identificador de la dependencia no es válido',
  })
  id_dependencia?: string | null;

  /**
   * Tipo de cuenta bancaria.
   */
  @ApiProperty({
    example: 'RECAUDADORA',
    maxLength: 30,
    description: 'Clasificación o tipo de cuenta bancaria.',
  })
  @IsString({ message: 'El tipo de cuenta debe ser un texto' })
  @Matches(/\S/, {
    message: 'El tipo de cuenta no puede estar vacío',
  })
  @MaxLength(30, {
    message: 'El tipo de cuenta no debe superar los 30 caracteres',
  })
  tipo!: string;
}
