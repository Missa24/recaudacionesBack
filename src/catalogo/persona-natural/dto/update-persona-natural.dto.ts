/**
 * Módulo: Catálogos - Personas Naturales
 * Archivo: update-persona-natural.dto.ts
 * Descripción:
 * Define los datos permitidos para actualizar parcialmente
 * la información de una persona natural.
 *
 * Desarrollado por: Missael Apaza
 */

import { PartialType } from '@nestjs/swagger';
import { CreatePersonaNaturalDto } from './create-persona-natural.dto';

/**
 * DTO para la actualización parcial de una persona natural.
 * Hereda las propiedades y validaciones del DTO de creación,
 * convirtiendo sus campos en opcionales.
 *
 * Desarrollado por: Missael Apaza
 */
export class UpdatePersonaNaturalDto extends PartialType(
  CreatePersonaNaturalDto,
) {}
