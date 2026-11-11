import { PartialType } from '@nestjs/swagger';
import { CreateArancelGeneralDto } from './create-arancel-general.dto';

export class UpdateArancelGeneralDto extends PartialType(CreateArancelGeneralDto) {}
