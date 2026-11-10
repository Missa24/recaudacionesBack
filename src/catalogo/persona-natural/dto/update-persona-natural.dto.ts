/**
 * Módulo: Catálogos - Personas Naturales
 * Archivo: update-persona-natural.dto.ts
 * Descripción:
 * Define los datos permitidos para actualizar parcialmente
 * la información de una persona natural.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */

import { PartialType } from '@nestjs/swagger';
import { CreatePersonaNaturalDto } from './create-persona-natural.dto';

/**
 * DTO para la actualización parcial de una persona natural.
 * Hereda las propiedades y validaciones del DTO de creación,
 * convirtiendo sus campos en opcionales.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */
export class UpdatePersonaNaturalDto extends PartialType(
  CreatePersonaNaturalDto,
) {}
