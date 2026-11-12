import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, ArrayUnique, IsArray, IsUUID } from 'class-validator';

/**
 * Módulo: Seguridad / RolModuloPermiso
 * Archivo: asignar-permisos-rol-modulo.dto.ts
 *
 * Descripción:
 * Define los permisos que se asignarán a un módulo
 * perteneciente a un rol determinado.
 *
 * Desarrollado por: Missael Apaza - Fecha: 12/11/2026
 */
export class AsignarPermisosRolModuloDto {
  @ApiProperty({
    description: 'Lista de identificadores UUID de los permisos.',
    example: [
      '8b461287-8416-412e-84e7-b5c77615ea2a',
      '9b461287-8416-412e-84e7-b5c77615ea2b',
    ],
  })
  @IsArray({ message: 'Los permisos deben enviarse como una lista' })
  @ArrayMinSize(1, { message: 'Debe seleccionar al menos un permiso' })
  @ArrayUnique({ message: 'No se permiten permisos duplicados' })
  @IsUUID(undefined, {
    each: true,
    message: 'Cada permiso debe tener un identificador UUID válido',
  })
  permisos!: string[];
}
