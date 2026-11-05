import { PartialType } from '@nestjs/mapped-types';
import { CreateIntereDto } from './create-intere.dto';

export class UpdateIntereDto extends PartialType(CreateIntereDto) {}
