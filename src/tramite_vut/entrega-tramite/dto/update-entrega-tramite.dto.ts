import { PartialType } from '@nestjs/swagger';
import { CreateEntregaTramiteDto } from './create-entrega-tramite.dto';

export class UpdateEntregaTramiteDto extends PartialType(CreateEntregaTramiteDto) {}
