import { PartialType } from '@nestjs/swagger';
import { CreateCorrelativoAnualDto } from './create-correlativo-anual.dto';

export class UpdateCorrelativoAnualDto extends PartialType(CreateCorrelativoAnualDto) {}
