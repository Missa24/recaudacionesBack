import { Injectable } from '@nestjs/common';
import { CreateLiquidicacionDetalleDto } from './dto/create-liquidicacion-detalle.dto';
import { UpdateLiquidicacionDetalleDto } from './dto/update-liquidicacion-detalle.dto';

@Injectable()
export class LiquidicacionDetalleService {
  create(createLiquidicacionDetalleDto: CreateLiquidicacionDetalleDto) {
    return 'This action adds a new liquidicacionDetalle';
  }

  findAll() {
    return `This action returns all liquidicacionDetalle`;
  }

  findOne(id: number) {
    return `This action returns a #${id} liquidicacionDetalle`;
  }

  update(id: number, updateLiquidicacionDetalleDto: UpdateLiquidicacionDetalleDto) {
    return `This action updates a #${id} liquidicacionDetalle`;
  }

  remove(id: number) {
    return `This action removes a #${id} liquidicacionDetalle`;
  }
}
