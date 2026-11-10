/**
 * Módulo: Catálogos - Personas Jurídicas
 * Archivo: create-persona-juridica.dto.ts
 * Descripción:
 * Define los datos y las validaciones necesarias para registrar
 * una persona jurídica en el sistema.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  IsOptional,
} from 'class-validator';

/**
 * DTO para la creación de una persona jurídica.
 * Establece los campos obligatorios y opcionales del registro,
 * junto con sus respectivas reglas de validación.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export class CreatePersonaJuridicaDto {
  /**
   * Número de identificación tributaria.
   */
  @ApiProperty({
    example: '123456789',
    maxLength: 30,
    description: 'NIT único de la persona jurídica.',
  })
  @IsString({ message: 'El NIT debe ser un texto' })
  @Matches(/\S/, {
    message: 'El NIT no puede estar vacío',
  })
  @MaxLength(30, {
    message: 'El NIT no debe superar los 30 caracteres',
  })
  nit!: string;

  /**
   * Razón social de la persona jurídica.
   */
  @ApiProperty({
    example: 'Empresa Ejemplo S.R.L.',
    maxLength: 250,
    description: 'Razón social obligatoria de la persona jurídica.',
  })
  @IsString({ message: 'La razón social debe ser un texto' })
  @Matches(/\S/, {
    message: 'La razón social no puede estar vacía',
  })
  @MaxLength(250, {
    message: 'La razón social no debe superar los 250 caracteres',
  })
  razon_social!: string;

  /**
   * Domicilio de la persona jurídica.
   */
  @ApiPropertyOptional({
    example: 'Av. Principal Nro. 123',
    maxLength: 250,
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'El domicilio debe ser un texto' })
  @MaxLength(250, {
    message: 'El domicilio no debe superar los 250 caracteres',
  })
  domicilio?: string | null;

  /**
   * Número de teléfono de contacto.
   */
  @ApiPropertyOptional({
    example: '"70000000"',
    maxLength: 20,
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser un texto' })
  @MaxLength(20, {
    message: 'El teléfono no debe superar los 20 caracteres',
  })
  telefono?: string | null;

  /**
   * Correo electrónico de contacto.
   */
  @ApiPropertyOptional({
    example: 'contacto@empresa.com',
    nullable: true,
  })
  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido' })
  email?: string | null;
}
