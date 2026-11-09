/**
 * Módulo: Catálogos - Personas Jurídicas
 * Archivo: update-persona-juridica.dto.ts
 * Descripción:
 * Define los datos permitidos para actualizar parcialmente
 * la información de una persona jurídica.
 *
 * Desarrollado por: Missael Apaza
 */

import { PartialType } from '@nestjs/swagger';
import { CreatePersonaJuridicaDto } from './create-persona-juridica.dto';

/**
 * DTO para la actualización parcial de una persona jurídica.
 * Hereda las propiedades y validaciones del DTO de creación,
 * convirtiendo sus campos en opcionales.
 *
 * Desarrollado por: Missael Apaza
 */
export class UpdatePersonaJuridicaDto extends PartialType(
  CreatePersonaJuridicaDto,
) {}
