import { Injectable } from '@nestjs/common';
import { CreateLiquidacionDetalleDto } from './dto/create-liquidacion_detalle.dto';
import { UpdateLiquidacionDetalleDto } from './dto/update-liquidacion_detalle.dto';

@Injectable()
export class LiquidacionDetalleService {
  create(createLiquidacionDetalleDto: CreateLiquidacionDetalleDto) {
    return 'This action adds a new liquidacionDetalle';
  }

  findAll() {
    return `This action returns all liquidacionDetalle`;
  }

  findOne(id: number) {
    return `This action returns a #${id} liquidacionDetalle`;
  }

  update(id: number, updateLiquidacionDetalleDto: UpdateLiquidacionDetalleDto) {
    return `This action updates a #${id} liquidacionDetalle`;
  }

  remove(id: number) {
    return `This action removes a #${id} liquidacionDetalle`;
  }
}
