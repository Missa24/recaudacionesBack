import {
  IsIP,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Módulo: Seguridad - Sesión
 * Archivo: create-sesion.dto.ts
 * Descripción:
 * Define los datos necesarios para registrar una nueva sesión.
 */
export class CreateSesionDto {
  @ApiProperty({
    description: 'UUID del usuario propietario de la sesión.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: 'El usuario es obligatorio' })
  @IsUUID('4', { message: 'El usuario debe ser un UUID válido' })
  usuario_id!: string;

  @ApiPropertyOptional({
    description: 'Dirección IP del cliente IPv4 o IPv6.',
    example: '192.168.1.100',
  })
  @IsOptional()
  @IsIP(undefined, {
    message: 'La dirección IP debe ser válida',
  })
  ipAddress?: string;

  @ApiPropertyOptional({
    description: 'Información del navegador o cliente.',
    example: 'Mozilla/5.0 Chrome/120.0',
  })
  @IsOptional()
  @IsString({ message: 'El user agent debe ser texto' })
  userAgent?: string;

  @ApiProperty({
    description: 'UUID del usuario que registra la sesión.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsNotEmpty({ message: 'El usuario creador es obligatorio' })
  @IsUUID('4', { message: 'El usuario creador debe ser un UUID válido' })
  _user_created!: string;
}
