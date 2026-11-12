import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

/**
 * Módulo: Seguridad - RolModuloPermiso
 * Archivo: create-rol-modulo-permiso.dto.ts
 *
 * Define los datos necesarios para asignar un permiso
 * a un rol dentro de un módulo.
 */
export class CreateRolModuloPermisoDto {
  @ApiProperty({
    description: 'Identificador UUID del rol.',
    example: '8b461287-8416-412e-84e7-b5c77615ea2a',
  })
  @IsNotEmpty({ message: 'El rol es obligatorio' })
  @IsUUID('4', { message: 'El identificador del rol no es válido' })
  rol_id!: string;

  @ApiProperty({
    description: 'Identificador UUID del módulo.',
    example: '8b461287-8416-412e-84e7-b5c77615ea2a',
  })
  @IsNotEmpty({ message: 'El módulo es obligatorio' })
  @IsUUID('4', { message: 'El identificador del módulo no es válido' })
  modulo_id!: string;

  @ApiProperty({
    description: 'Identificador UUID del permiso.',
    example: '8b461287-8416-412e-84e7-b5c77615ea2a',
  })
  @IsNotEmpty({ message: 'El permiso es obligatorio' })
  @IsUUID('4', { message: 'El identificador del permiso no es válido' })
  permiso_id!: string;
}
