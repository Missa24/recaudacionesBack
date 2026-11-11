import { Injectable } from '@nestjs/common';
import { CreateCotizacionDetalleDto } from './dto/create-cotizacion_detalle.dto';
import { UpdateCotizacionDetalleDto } from './dto/update-cotizacion_detalle.dto';

@Injectable()
export class CotizacionDetalleService {
  create(createCotizacionDetalleDto: CreateCotizacionDetalleDto) {
    return 'This action adds a new cotizacionDetalle';
  }

  findAll() {
    return `This action returns all cotizacionDetalle`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cotizacionDetalle`;
  }

  update(id: number, updateCotizacionDetalleDto: UpdateCotizacionDetalleDto) {
    return `This action updates a #${id} cotizacionDetalle`;
  }

  remove(id: number) {
    return `This action removes a #${id} cotizacionDetalle`;
  }
}
