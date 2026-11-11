/**
 * Módulo: Catálogo - Requisito
 * Archivo: update-requisito.dto.ts
 * Descripción:
 * Define los datos actualizables de un requisito existente.
 *
 * Desarrollado por: Missael Apaza - Fecha: 10/11/2026
 */

import { PartialType } from '@nestjs/swagger';
import { CreateRequisitoDto } from './create-requisito.dto';

export class UpdateRequisitoDto extends PartialType(CreateRequisitoDto) {}
