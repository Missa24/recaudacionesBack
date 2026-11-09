/**
 * Módulo: Catálogos - Personas Naturales
 * Archivo: create-persona-natural.dto.ts
 * Descripción:
 * Define los datos y las validaciones necesarias para registrar
 * una persona natural en el sistema.
 *
 * Desarrollado por: Missael Apaza
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  Matches,
  ValidateIf,
} from 'class-validator';

/**
 * DTO para la creación de una persona natural.
 * Establece los campos obligatorios y opcionales del registro,
 * junto con sus respectivas reglas de validación.
 *
 * Desarrollado por: Missael Apaza
 */
export class CreatePersonaNaturalDto {
  /*
   * Tipo de documento de identidad.
   * Desarrollado por: Missael Apaza
   */
  @ApiProperty({ example: 'CI', maxLength: 20 })
  @IsString({ message: 'El tipo de documento debe ser un texto' })
  @Matches(/\S/, { message: 'El tipo de documento no puede estar vacío' })
  @MaxLength(20, {
    message: 'El tipo de documento no debe superar los 20 caracteres',
  })
  tipo_documento!: string;

  /*
   * Número del documento de identidad.
   * Desarrollado por: Missael Apaza
   */
  @ApiProperty({ example: '1234567', maxLength: 30 })
  @IsString({ message: 'El número de documento debe ser un texto' })
  @Matches(/\S/, { message: 'El número de documento no puede estar vacío' })
  @MaxLength(30, {
    message: 'El número de documento no debe superar los 30 caracteres',
  })
  numero_documento!: string;

  /*
   * Complemento del documento de identidad.
   * Desarrollado por: Missael Apaza
   */
  @ApiPropertyOptional({ example: '', default: '' })
  @ValidateIf((_, value) => value !== undefined)
  @IsString({ message: 'El complemento debe ser un texto' })
  @MaxLength(10, {
    message: 'El complemento no debe superar los 10 caracteres',
  })
  complemento?: string;

  /*
   * Lugar de expedición del documento de identidad.
   * Desarrollado por: Missael Apaza
   */
  @ApiPropertyOptional({ example: 'LP', default: '' })
  @ValidateIf((_, value) => value !== undefined)
  @IsString({ message: 'El lugar de expedición debe ser un texto' })
  @MaxLength(10, {
    message: 'El lugar de expedición no debe superar los 10 caracteres',
  })
  expedido?: string;

  /*
   * Nombres de la persona natural.
   * Desarrollado por: Missael Apaza
   */
  @ApiProperty({ example: 'Juan Carlos', maxLength: 150 })
  @IsString({ message: 'Los nombres deben ser un texto' })
  @Matches(/\S/, { message: 'Los nombres no pueden estar vacíos' })
  @MaxLength(150, {
    message: 'Los nombres no deben superar los 150 caracteres',
  })
  nombres!: string;

  /*
   * Apellido paterno de la persona natural.
   * Desarrollado por: Missael Apaza
   */
  @ApiPropertyOptional({ example: 'Pérez', maxLength: 150, nullable: true })
  @IsOptional()
  @IsString({ message: 'El apellido paterno debe ser un texto' })
  @MaxLength(150, {
    message: 'El apellido paterno no debe superar los 150 caracteres',
  })
  apellido_paterno?: string | null;

  /*
   * Apellido materno de la persona natural.
   * Desarrollado por: Missael Apaza
   */
  @ApiPropertyOptional({ example: 'Gómez', maxLength: 150, nullable: true })
  @IsOptional()
  @IsString({ message: 'El apellido materno debe ser un texto' })
  @MaxLength(150, {
    message: 'El apellido materno no debe superar los 150 caracteres',
  })
  apellido_materno?: string | null;

  /*
   * Domicilio de la persona natural.
   * Desarrollado por: Missael Apaza
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

  /*
   * Número de teléfono de contacto.
   * Desarrollado por: Missael Apaza
   */
  @ApiPropertyOptional({ example: '"70000000"', maxLength: 20, nullable: true })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser un texto' })
  @MaxLength(20, {
    message: 'El teléfono no debe superar los 20 caracteres',
  })
  telefono?: string | null;

  /*
   * Correo electrónico de contacto.
   * Desarrollado por: Missael Apaza
   */
  @ApiPropertyOptional({ example: 'juan@example.com', nullable: true })
  @IsOptional()
  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido' })
  email?: string | null;

  /*
   * Fecha de nacimiento de la persona natural.
   * Desarrollado por: Missael Apaza
   */
  @ApiPropertyOptional({ example: '1995-05-12', nullable: true })
  @IsOptional()
  @IsDateString(
    {},
    {
      message:
        'La fecha de nacimiento debe tener un formato válido (AAAA-MM-DD)',
    },
  )
  fecha_nacimiento?: string | null;

  /*
   * Apellido de casada, cuando corresponda.
   * Desarrollado por: Missael Apaza
   */
  @ApiPropertyOptional({ example: 'López', maxLength: 150, nullable: true })
  @IsOptional()
  @IsString({ message: 'El apellido de casada debe ser un texto' })
  @MaxLength(150, {
    message: 'El apellido de casada no debe superar los 150 caracteres',
  })
  apellido_casada?: string | null;

  /*
   * Estado civil declarado por la persona natural.
   * Desarrollado por: Missael Apaza
   */
  @ApiPropertyOptional({
    example: 'NO DECLARADO',
    enum: ['NO DECLARADO'],
    default: 'NO DECLARADO',
  })
  @IsOptional()
  @IsIn(['NO DECLARADO'], {
    message:
      'El estado civil debe ser uno de los siguientes valores: NO DECLARADO',
  })
  estado_civil?: string;
}
