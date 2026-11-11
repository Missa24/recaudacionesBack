import { Injectable } from '@nestjs/common';
import { CreateEventoTramiteDto } from './dto/create-evento-tramite.dto';
import { UpdateEventoTramiteDto } from './dto/update-evento-tramite.dto';

@Injectable()
export class EventoTramiteService {
  create(createEventoTramiteDto: CreateEventoTramiteDto) {
    return 'This action adds a new eventoTramite';
  }

  findAll() {
    return `This action returns all eventoTramite`;
  }

  findOne(id: number) {
    return `This action returns a #${id} eventoTramite`;
  }

  update(id: number, updateEventoTramiteDto: UpdateEventoTramiteDto) {
    return `This action updates a #${id} eventoTramite`;
  }

  remove(id: number) {
    return `This action removes a #${id} eventoTramite`;
  }
}
