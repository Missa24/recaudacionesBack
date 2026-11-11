import { Injectable } from '@nestjs/common';
import { CreateEntregaTramiteDto } from './dto/create-entrega-tramite.dto';
import { UpdateEntregaTramiteDto } from './dto/update-entrega-tramite.dto';

@Injectable()
export class EntregaTramiteService {
  create(createEntregaTramiteDto: CreateEntregaTramiteDto) {
    return 'This action adds a new entregaTramite';
  }

  findAll() {
    return `This action returns all entregaTramite`;
  }

  findOne(id: number) {
    return `This action returns a #${id} entregaTramite`;
  }

  update(id: number, updateEntregaTramiteDto: UpdateEntregaTramiteDto) {
    return `This action updates a #${id} entregaTramite`;
  }

  remove(id: number) {
    return `This action removes a #${id} entregaTramite`;
  }
}
