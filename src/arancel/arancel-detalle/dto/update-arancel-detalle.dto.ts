import { PartialType } from '@nestjs/swagger';
import { CreateArancelDetalleDto } from './create-arancel-detalle.dto';

export class UpdateArancelDetalleDto extends PartialType(CreateArancelDetalleDto) {}
