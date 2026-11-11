import { PartialType } from '@nestjs/swagger';
import { CreateEventoTramiteDto } from './create-evento-tramite.dto';

export class UpdateEventoTramiteDto extends PartialType(CreateEventoTramiteDto) {}
