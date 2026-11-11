import { Injectable } from '@nestjs/common';
import { CreateArancelDetalleDto } from './dto/create-arancel-detalle.dto';
import { UpdateArancelDetalleDto } from './dto/update-arancel-detalle.dto';

@Injectable()
export class ArancelDetalleService {
  create(createArancelDetalleDto: CreateArancelDetalleDto) {
    return 'This action adds a new arancelDetalle';
  }

  findAll() {
    return `This action returns all arancelDetalle`;
  }

  findOne(id: number) {
    return `This action returns a #${id} arancelDetalle`;
  }

  update(id: number, updateArancelDetalleDto: UpdateArancelDetalleDto) {
    return `This action updates a #${id} arancelDetalle`;
  }

  remove(id: number) {
    return `This action removes a #${id} arancelDetalle`;
  }
}
