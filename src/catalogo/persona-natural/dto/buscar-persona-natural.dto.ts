/**
 * Módulo: Catálogos - Personas Naturales
 * Archivo: buscar-persona-natural.dto.ts
 * Descripción:
 * Define los parámetros documentales utilizados para buscar
 * personas naturales mediante su documento de identidad.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

/**
 * DTO para la búsqueda de personas naturales por documento.
 * Permite realizar búsquedas utilizando el tipo y número
 * de documento, con complemento y expedido opcionales.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export class BuscarPersonaNaturalDto {
  /*
   * Tipo de documento de identidad.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  @ApiProperty({ example: 'CI' })
  @IsString({ message: 'El tipo de documento debe ser un texto' })
  @Matches(/\S/, { message: 'El tipo de documento no puede estar vacío' })
  @MaxLength(20, {
    message: 'El tipo de documento no debe superar los 20 caracteres',
  })
  tipo_documento!: string;

  /*
   * Número del documento de identidad.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  @ApiProperty({ example: '1234567' })
  @IsString({ message: 'El número de documento debe ser un texto' })
  @Matches(/\S/, { message: 'El número de documento no puede estar vacío' })
  @MaxLength(30, {
    message: 'El número de documento no debe superar los 30 caracteres',
  })
  numero_documento!: string;

  /*
   * Complemento del documento, cuando corresponda.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  @ApiPropertyOptional({
    example: '1A',
    description: 'Complemento del documento de identidad, si corresponde.',
  })
  @IsOptional()
  @IsString({ message: 'El complemento debe ser un texto' })
  @MaxLength(10, {
    message: 'El complemento no debe superar los 10 caracteres',
  })
  complemento?: string;

  /*
   * Lugar de expedición del documento, cuando se conozca.
   *
   * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
   */
  @ApiPropertyOptional({
    example: 'LP',
    description: 'Lugar de expedición del documento, si se conoce.',
  })
  @IsOptional()
  @IsString({ message: 'El lugar de expedición debe ser un texto' })
  @MaxLength(10, {
    message: 'El lugar de expedición no debe superar los 10 caracteres',
  })
  expedido?: string;
}
