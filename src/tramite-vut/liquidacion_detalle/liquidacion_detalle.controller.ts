import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LiquidacionDetalleService } from './liquidacion_detalle.service';
import { CreateLiquidacionDetalleDto } from './dto/create-liquidacion_detalle.dto';
import { UpdateLiquidacionDetalleDto } from './dto/update-liquidacion_detalle.dto';

@Controller('liquidacion-detalle')
export class LiquidacionDetalleController {
  constructor(private readonly liquidacionDetalleService: LiquidacionDetalleService) {}

  @Post()
  create(@Body() createLiquidacionDetalleDto: CreateLiquidacionDetalleDto) {
    return this.liquidacionDetalleService.create(createLiquidacionDetalleDto);
  }

  @Get()
  findAll() {
    return this.liquidacionDetalleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.liquidacionDetalleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLiquidacionDetalleDto: UpdateLiquidacionDetalleDto) {
    return this.liquidacionDetalleService.update(+id, updateLiquidacionDetalleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.liquidacionDetalleService.remove(+id);
  }
}
