import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * Módulo: Seguridad - Usuario
 * Archivo: create-usuario.dto.ts
 *
 * Descripción:
 * Define los datos necesarios para registrar un nuevo usuario.
 *
 * Desarrollado por: Missael Apaza - Fecha: 11/11/2026
 */
export class CreateUsuarioDto {
  /** Nombre de usuario utilizado para identificarlo. */
  @ApiPropertyOptional({ example: 'juan.perez' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  username?: string;

  /** Correo electrónico del usuario. */
  @ApiProperty({ example: 'juan@gmail.com' })
  @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido' })
  @MaxLength(255)
  email!: string;

  /** Número de carnet de identidad. */
  @ApiProperty({ example: '12345678' })
  @IsString()
  @MaxLength(30)
  ci!: string;

  /** Nombres del usuario. */
  @ApiPropertyOptional({ example: 'Juan' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombres?: string;

  /** Apellido paterno del usuario. */
  @ApiPropertyOptional({ example: 'Pérez' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  apellidoPaterno?: string;

  /** Apellido materno del usuario. */
  @ApiPropertyOptional({ example: 'López' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  apellidoMaterno?: string | null;

  /** Número de celular del usuario. */
  @ApiPropertyOptional({ example: '"70000000"' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  celular?: string | null;
}
