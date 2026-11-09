/**
 * Módulo: Catálogos - Personas Jurídicas
 * Archivo: buscar-persona-juridica.dto.ts
 * Descripción:
 * Define los parámetros utilizados para buscar
 * personas jurídicas mediante su NIT.
 *
 * Desarrollado por: Missael Apaza
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength } from 'class-validator';

/**
 * DTO para la búsqueda de personas jurídicas por NIT.
 *
 * Desarrollado por: Missael Apaza
 */
export class BuscarPersonaJuridicaDto {
  /**
   * Número de identificación tributaria.
   */
  @ApiProperty({
    example: '123456789',
    maxLength: 30,
    description: 'NIT de la persona jurídica que se desea buscar.',
  })
  @IsString({ message: 'El NIT debe ser un texto' })
  @Matches(/\S/, {
    message: 'El NIT no puede estar vacío',
  })
  @MaxLength(30, {
    message: 'El NIT no debe superar los 30 caracteres',
  })
  nit!: string;
}
