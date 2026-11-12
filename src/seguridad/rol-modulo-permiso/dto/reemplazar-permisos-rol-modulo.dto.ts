import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsUUID } from 'class-validator';

/**
 * Módulo: Seguridad / RolModuloPermiso
 * Archivo: reemplazar-permisos-rol-modulo.dto.ts
 *
 * Descripción:
 * Define la lista completa de permisos que tendrá un módulo
 * dentro de un rol. Permite enviar una lista vacía para
 * desactivar todos los permisos del módulo.
 *
 * Desarrollado por: Missael Apaza - Fecha: 12/11/2026
 */
export class ReemplazarPermisosRolModuloDto {
  @ApiProperty({
    description:
      'Lista completa de permisos. Una lista vacía desactiva todos los permisos.',
    example: [
      '8b461287-8416-412e-84e7-b5c77615ea2a',
      '9b461287-8416-412e-84e7-b5c77615ea2b',
    ],
    type: [String],
  })
  @IsArray({ message: 'Los permisos deben enviarse como una lista' })
  @ArrayUnique({ message: 'No se permiten permisos duplicados' })
  @IsUUID(undefined, {
    each: true,
    message: 'Cada permiso debe tener un identificador UUID válido',
  })
  permisos!: string[];
}
