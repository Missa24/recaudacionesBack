import { PartialType } from '@nestjs/swagger';
import { CreateRequisitoEntregadoDto } from './create-requisito-entregado.dto';

export class UpdateRequisitoEntregadoDto extends PartialType(CreateRequisitoEntregadoDto) {}
