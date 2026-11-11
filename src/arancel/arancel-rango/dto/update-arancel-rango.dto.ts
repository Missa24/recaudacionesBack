import { PartialType } from '@nestjs/swagger';
import { CreateArancelRangoDto } from './create-arancel-rango.dto';

export class UpdateArancelRangoDto extends PartialType(CreateArancelRangoDto) {}
