/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'usuario.demo', description: 'Nombre de usuario' })
  @IsString()
  @IsNotEmpty()
  username: string | undefined;

  @ApiProperty({ example: '********', format: 'password', description: 'Contraseña' })
  @IsString()
  @IsNotEmpty()
  password: string | undefined;
}