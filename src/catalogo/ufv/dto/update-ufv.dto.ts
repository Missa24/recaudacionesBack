import { PartialType } from '@nestjs/mapped-types';
import { CreateUfvDto } from './create-ufv.dto';

export class UpdateUfvDto extends PartialType(CreateUfvDto) {}
