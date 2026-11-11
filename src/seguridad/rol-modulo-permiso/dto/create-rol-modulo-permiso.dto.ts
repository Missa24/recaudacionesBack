import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateRolModuloPermisoDto {
  @ApiProperty({ example: '20000000-0000-4000-8000-000000000004' })
  @IsUUID()
  id_rol!: string;

  @ApiProperty({ example: '30000000-0000-4000-8000-000000000004' })
  @IsUUID()
  id_modulo!: string;

  @ApiProperty({ example: '40000000-0000-4000-8000-000000000003' })
  @IsUUID()
  id_permiso!: string;
}
