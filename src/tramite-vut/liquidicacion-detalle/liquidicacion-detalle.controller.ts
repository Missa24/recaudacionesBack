import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LiquidicacionDetalleService } from './liquidicacion-detalle.service';
import { CreateLiquidicacionDetalleDto } from './dto/create-liquidicacion-detalle.dto';
import { UpdateLiquidicacionDetalleDto } from './dto/update-liquidicacion-detalle.dto';

@Controller('liquidicacion-detalle')
export class LiquidicacionDetalleController {
  constructor(private readonly liquidicacionDetalleService: LiquidicacionDetalleService) {}

  @Post()
  create(@Body() createLiquidicacionDetalleDto: CreateLiquidicacionDetalleDto) {
    return this.liquidicacionDetalleService.create(createLiquidicacionDetalleDto);
  }

  @Get()
  findAll() {
    return this.liquidicacionDetalleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.liquidicacionDetalleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLiquidicacionDetalleDto: UpdateLiquidicacionDetalleDto) {
    return this.liquidicacionDetalleService.update(+id, updateLiquidicacionDetalleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.liquidicacionDetalleService.remove(+id);
  }
}
