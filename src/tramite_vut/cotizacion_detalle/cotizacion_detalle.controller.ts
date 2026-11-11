import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CotizacionDetalleService } from './cotizacion_detalle.service';
import { CreateCotizacionDetalleDto } from './dto/create-cotizacion_detalle.dto';
import { UpdateCotizacionDetalleDto } from './dto/update-cotizacion_detalle.dto';

@Controller('cotizacion-detalle')
export class CotizacionDetalleController {
  constructor(private readonly cotizacionDetalleService: CotizacionDetalleService) {}

  @Post()
  create(@Body() createCotizacionDetalleDto: CreateCotizacionDetalleDto) {
    return this.cotizacionDetalleService.create(createCotizacionDetalleDto);
  }

  @Get()
  findAll() {
    return this.cotizacionDetalleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cotizacionDetalleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCotizacionDetalleDto: UpdateCotizacionDetalleDto) {
    return this.cotizacionDetalleService.update(+id, updateCotizacionDetalleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cotizacionDetalleService.remove(+id);
  }
}
