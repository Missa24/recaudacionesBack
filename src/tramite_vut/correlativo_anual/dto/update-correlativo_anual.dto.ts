import { PartialType } from '@nestjs/swagger';
import { CreateCorrelativoAnualDto } from './create-correlativo_anual.dto';

export class UpdateCorrelativoAnualDto extends PartialType(CreateCorrelativoAnualDto) {}
