import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, Matches, MaxLength } from 'class-validator';

/**
 * Datos para crear permiso. Estado y auditoría son asignados por el servicio.
 * Desarrollado por: Oscar Canchari.
 */
export class CreatePermisoDto {
  /** Obligatorio; no admite texto vacío. */
  @ApiProperty({ example: 'Consultar usuarios', maxLength: 150 })
  @IsString({ message: 'nombre debe ser un texto.' })
  @MaxLength(150, { message: 'nombre admite hasta 150 caracteres.' })
  @Matches(/\S/, { message: 'nombre no puede estar vacío.' })
  nombre!: string;

  /** Obligatorio; no admite texto vacío. */
  @ApiProperty({ example: 'USUARIO_CONSULTAR', maxLength: 40 })
  @IsString({ message: 'codigo debe ser un texto.' })
  @MaxLength(40, { message: 'codigo admite hasta 40 caracteres.' })
  @Matches(/^[A-Za-z0-9_]+$/, {
    message: 'codigo solo permite letras, números y guiones bajos.',
  })
  codigo!: string;

  /** Opcional; permite null para limpiar el valor. */
  @ApiPropertyOptional({
    example: 'Descripción de las funciones.',
    maxLength: 5000,
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'descripcion debe ser un texto.' })
  @MaxLength(5000, { message: 'descripcion admite hasta 5000 caracteres.' })
  descripcion?: string | null;
}
