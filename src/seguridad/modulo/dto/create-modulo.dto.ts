import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Módulo: Seguridad - Módulo
 * Archivo: create-modulo.dto.ts
 * Descripción:
 * Define los datos necesarios para registrar un módulo funcional.
 */
export class CreateModuloDto {
  @ApiProperty({
    description: 'Nombre visible del módulo.',
    example: 'Gestión de usuarios',
    maxLength: 150,
  })
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @MaxLength(150, {
    message: 'El nombre no debe superar los 150 caracteres',
  })
  nombre!: string;

  @ApiProperty({
    description: 'Código funcional único del módulo.',
    example: 'USUARIOS',
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'El código no puede estar vacío' })
  @IsString({ message: 'El código debe ser un texto' })
  @MaxLength(50, {
    message: 'El código no debe superar los 50 caracteres',
  })
  codigo!: string;

  @ApiPropertyOptional({
    description: 'Descripción funcional del módulo.',
    example: 'Administración de usuarios del sistema.',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  descripcion?: string | null;

  @ApiProperty({
    description: 'Ruta interna de navegación del módulo.',
    example: '/seguridad/usuarios',
    maxLength: 250,
  })
  @IsNotEmpty({ message: 'La ruta no puede estar vacía' })
  @IsString({ message: 'La ruta debe ser un texto' })
  @MaxLength(250, {
    message: 'La ruta no debe superar los 250 caracteres',
  })
  ruta!: string;
}
