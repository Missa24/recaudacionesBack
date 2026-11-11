import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateUsuarioRolDto {
  @ApiProperty({ example: '10000000-0000-4000-8000-000000000001' })
  @IsUUID()
  id_usuario!: string;

  @ApiProperty({ example: '20000000-0000-4000-8000-000000000001' })
  @IsUUID()
  id_rol!: string;
}
